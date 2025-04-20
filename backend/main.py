from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
import os

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json

DB_PATH = "log_analyzer.db"

import re

# Initialize DB on startup
@app.on_event("startup")
def startup():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        loglevel TEXT,
        timestamp TEXT,
        message TEXT
    )''')
    conn.commit()
    conn.close()

@app.delete("/logs/")
def clear_logs():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM logs')
    c.execute("DELETE FROM sqlite_sequence WHERE name='logs'")  # Reset AUTOINCREMENT counter
    conn.commit()
    conn.close()
    return {"status": "cleared"}

@app.post("/upload/")
async def upload_log(file: UploadFile = File(...)):
    if not file.filename.endswith('.log'):
        raise HTTPException(status_code=400, detail="Only .log files are allowed.")
    content = await file.read()
    lines = content.decode().splitlines()
    parsed = []

    # Regexes for various log formats
    regexes = [
        # [timestamp] LOGLEVEL ...
        re.compile(r'\[([^\]]+)\]\s*(\w+)'),
        # Hadoop/YARN: 081109 203615 148 INFO ...
        re.compile(r'^(\d{6})\s+(\d{6})\s+(\d+)\s+(\w+)'),
        # ISO 8601: 2025-04-19T00:00:00 INFO ...
        re.compile(r'^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\s+(\w+)'),
        # Windows Event: 2016-09-28 04:30:30, Info ...
        re.compile(r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\s*(\w+)'),
        # Spark/YARN/Java: 17/06/09 20:10:40 INFO ...
        re.compile(r'^(\d{2}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) (\w+)'),
        # Syslog: Jul 1 09:00:55 hostname process[pid]: ...
        re.compile(r'^([A-Za-z]{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^\[]+)\[(\d+)\]:\s*(.*)'),
        # Apache/Nginx access log: 127.0.0.1 - - [10/Oct/2021:13:55:36 +0000] "GET /index.html HTTP/1.1" 200 2326
        re.compile(r'^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d{3})\s+(\d+)'),
        # Java stack trace: at com.example.MyClass.method(MyClass.java:10)
        re.compile(r'^at\s+([\w\.]+)\(([^:]+):(\d+)\)'),
        # Windows Event: 2025-04-19 00:00:00,123 [INFO] ...
        re.compile(r'^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s+\[(\w+)\]'),
        # Generic: 2025-04-19 00:00:00 INFO ...
        re.compile(r'^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\w+)'),
        # Generic: LOGLEVEL yyyy-mm-dd ...
        re.compile(r'^(\w+)\s+(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})'),
        # To add support for more log types, simply append new regex patterns here.
    ]

    from datetime import datetime
    def normalize_timestamp(ts):
        # Try to parse various formats and convert to ISO
        for fmt in [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S,%f",
            "%Y-%m-%dT%H:%M:%S,%f",
            "%d/%m/%y %H:%M:%S",
            "%b %d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S.%f",
            "%y%m%d %H%M%S",
            "%y%m%d %H%M%S %f",
        ]:
            try:
                dt = datetime.strptime(ts, fmt)
                # If year is missing (e.g. syslog), skip
                if dt.year < 1970:
                    continue
                return dt.strftime("%Y-%m-%dT%H:%M:%S")
            except Exception:
                continue
        # If already ISO and matches pattern
        if re.match(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", ts):
            return ts[:19]
        return ts  # fallback: store as-is

    for line in lines:
        loglevel, timestamp = '', ''
        # Try regexes for direct extraction
        for regex in regexes:
            match = regex.match(line)
            if match:
                # Try to assign timestamp/loglevel from capturing groups
                if regex.pattern.startswith('^\['):  # [timestamp] LOGLEVEL ...
                    timestamp = match.group(1)
                    loglevel = match.group(2)
                elif regex.pattern.startswith('^(\d{6})'):  # Hadoop: date time pid LOGLEVEL ...
                    # Join date and time for timestamp
                    timestamp = f"{match.group(1)} {match.group(2)}"
                    loglevel = match.group(4).upper()
                elif regex.pattern.startswith('^(\d{4}-'):  # ISO timestamp LOGLEVEL ...
                    timestamp = match.group(1)
                    loglevel = match.group(2)
                elif regex.pattern.startswith('^([A-Za-z]{3}'):  # Improved syslog
                    timestamp = match.group(1)
                    # hostname = match.group(2)  # Could be stored if needed
                    # process = match.group(3)
                    # pid = match.group(4)
                    # Try to extract loglevel from start of message (group 5)
                    msg_rest = match.group(5)
                    known_levels = {'INFO', 'ERROR', 'WARN', 'DEBUG', 'TRACE', 'FATAL'}
                    msg_first_word = msg_rest.split()[0] if msg_rest else ''
                    if msg_first_word in known_levels:
                        loglevel = msg_first_word.upper()
                elif regex.pattern.startswith('^(\d{2}/'):  # Spark/YARN/Java
                    timestamp = match.group(1)
                    loglevel = match.group(2).upper()
                break
        # If still not found, fallback: try splitting by whitespace for generic logs
        if not timestamp and not loglevel:
            parts = line.split()
            if len(parts) >= 4:
                # If timestamp looks like two numeric fields (date+time), join them
                if parts[0].isdigit() and parts[1].isdigit():
                    timestamp = f"{parts[0]} {parts[1]}"
                    loglevel = parts[3].upper()
        # Debug print (remove in production)
        print(f"DEBUG: line='{line}' | timestamp='{timestamp}' | loglevel='{loglevel}'")
        # Final defensive normalization
        loglevel = loglevel.upper() if loglevel else ""
        timestamp = normalize_timestamp(timestamp) if timestamp else ""
        parsed.append((file.filename, loglevel, timestamp, line))

    # Store to DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executemany('INSERT INTO logs (filename, loglevel, timestamp, message) VALUES (?, ?, ?, ?)', parsed)
    conn.commit()
    conn.close()
    return {"status": "uploaded", "count": len(parsed)}

@app.get("/logs/")
def get_logs(
    loglevel: str = None,
    filename: str = None,
    timestamp: str = None,
    timestamp_from: str = Query(None, description="Start of timestamp range (inclusive), ISO format recommended"),
    timestamp_to: str = Query(None, description="End of timestamp range (inclusive), ISO format recommended")
):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    query = 'SELECT id, filename, loglevel, timestamp, message FROM logs WHERE 1=1'
    params = []
    if loglevel:
        query += ' AND loglevel = ?'
        params.append(loglevel)
    if filename:
        query += ' AND filename = ?'
        params.append(filename)
    if timestamp:
        query += ' AND timestamp = ?'
        params.append(timestamp)
    if timestamp_from:
        query += ' AND timestamp >= ?'
        params.append(timestamp_from)
    if timestamp_to:
        query += ' AND timestamp <= ?'
        params.append(timestamp_to)
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return {"logs": rows}

@app.get("/loglevels/")
def get_loglevels():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT DISTINCT loglevel FROM logs WHERE loglevel != ""')
    levels = list({row[0].upper() for row in c.fetchall() if row[0]})
    conn.close()
    return {"loglevels": levels}

@app.get("/filenames/")
def get_filenames():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT DISTINCT filename FROM logs WHERE filename != ""')
    filenames = list({row[0] for row in c.fetchall() if row[0]})
    conn.close()
    return {"filenames": filenames}
