import sqlite3

conn = sqlite3.connect("simulation.db")
cursor = conn.cursor()

print("Tables:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

print("\nRuns:")
cursor.execute("SELECT * FROM simulation_runs;")
print(cursor.fetchall())

print("\nMetrics Count:")
cursor.execute("SELECT count(*) FROM tick_metrics;")
print(cursor.fetchall())
