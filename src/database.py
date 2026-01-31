import sqlite3
import json
import os
from datetime import datetime

DB_PATH = "simulation.db"

class DatabaseManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.conn = None
        self.init_db()

    def get_connection(self):
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
        return self.conn

    def init_db(self):
        """Initialize database schema."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 1. Simulation Runs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS simulation_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT,
                end_time TEXT,
                config TEXT
            )
        ''')

        # 2. Tick Metrics (Global Stats per step)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tick_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER,
                tick INTEGER,
                healthy_count INTEGER,
                cancer_count INTEGER,
                active_bots INTEGER,
                efficiency REAL,
                total_cells INTEGER,
                FOREIGN KEY(run_id) REFERENCES simulation_runs(id)
            )
        ''')

        # 3. Audit Logs (Events)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER,
                tick INTEGER,
                event_type TEXT,
                details TEXT,
                FOREIGN KEY(run_id) REFERENCES simulation_runs(id)
            )
        ''')
        
        conn.commit()

    def start_run(self, config):
        """Creates a new run entry and returns the run_id."""
        conn = self.get_connection()
        cursor = conn.cursor()
        start_time = datetime.now().isoformat()
        
        cursor.execute(
            "INSERT INTO simulation_runs (start_time, config) VALUES (?, ?)",
            (start_time, json.dumps(config))
        )
        conn.commit()
        return cursor.lastrowid

    def end_run(self, run_id):
        """Updates the end_time for a run."""
        conn = self.get_connection()
        end_time = datetime.now().isoformat()
        conn.execute(
            "UPDATE simulation_runs SET end_time = ? WHERE id = ?",
            (end_time, run_id)
        )
        conn.commit()

    def log_metrics(self, run_id, tick, metrics):
        """Inserts a tick metric record."""
        conn = self.get_connection()
        conn.execute('''
            INSERT INTO tick_metrics (run_id, tick, healthy_count, cancer_count, active_bots, efficiency, total_cells)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            run_id, 
            tick, 
            metrics.get('healthy_count', 0),
            metrics.get('cancer_count', 0),
            metrics.get('active_bots', 0),
            metrics.get('efficiency', 0.0),
            metrics.get('total_cells', 0)
        ))
        conn.commit()

    def log_event(self, run_id, tick, event_type, details):
        """Inserts an audit log event."""
        conn = self.get_connection()
        conn.execute(
            "INSERT INTO audit_logs (run_id, tick, event_type, details) VALUES (?, ?, ?, ?)",
            (run_id, tick, event_type, json.dumps(details))
        )
        conn.commit()

    def get_all_runs(self):
        conn = self.get_connection()
        cursor = conn.execute("SELECT * FROM simulation_runs ORDER BY id DESC")
        return [dict(row) for row in cursor.fetchall()]

    def get_run_metrics(self, run_id):
        conn = self.get_connection()
        cursor = conn.execute("SELECT * FROM tick_metrics WHERE run_id = ? ORDER BY tick ASC", (run_id,))
        return [dict(row) for row in cursor.fetchall()]
