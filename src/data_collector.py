from src.database import DatabaseManager

class DataCollector:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.run_id = None
        self.current_tick = 0
        self.config = {}

    def start_collection(self, config):
        self.config = config
        self.run_id = self.db.start_run(config)
        self.current_tick = 0
        print(f"Data Collection Started | Run ID: {self.run_id}")

    def stop_collection(self):
        if self.run_id:
            self.db.end_run(self.run_id)
            print(f"Data Collection Stopped | Run ID: {self.run_id}")
            self.run_id = None

    def log_step(self, model):
        if not self.run_id:
            return

        self.current_tick += 1
        
        # Calculate Metrics
        cells = [a for a in model.agents_list if a.__class__.__name__ == 'Cell']
        bots = [a for a in model.agents_list if a.__class__.__name__ == 'NanoBot']
        
        healthy = len([c for c in cells if not c.is_cancer])
        cancer = len([c for c in cells if c.is_cancer])
        active_bots = len([b for b in bots if b.state != "IDLE"])
        total_cells = len(cells)
        efficiency = (active_bots / len(bots)) * 100 if bots else 0

        metrics = {
            'healthy_count': healthy,
            'cancer_count': cancer,
            'active_bots': active_bots,
            'efficiency': efficiency,
            'total_cells': total_cells
        }
        
        self.db.log_metrics(self.run_id, self.current_tick, metrics)
        
        # Check for events (example: significant population shifts)
        # In a real scenario, agents would emit events, but for now we monitor state changes here if needed
        pass

    def log_custom_event(self, event_type, details):
        if self.run_id:
            self.db.log_event(self.run_id, self.current_tick, event_type, details)
