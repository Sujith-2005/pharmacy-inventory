
import os
import subprocess
import time

def kill_port_8002():
    print("Scanning Port 8002...")
    while True:
        try:
            # Get PIDs listening on 8002
            cmd = 'netstat -ano | findstr :8002'
            output = subprocess.check_output(cmd, shell=True).decode()
            lines = output.strip().split('\n')
            pids = set()
            for line in lines:
                parts = line.split()
                if 'LISTENING' in line:
                    if len(parts) > 4:
                        pids.add(parts[-1])
            
            if not pids:
                print("Port 8002 is CLEAN.")
                break
            
            print(f"Found processes: {pids}")
            for pid in pids:
                if pid == "0": continue
                print(f"Killing PID {pid}...")
                os.system(f"taskkill /F /PID {pid}")
            
            time.sleep(1)
        except subprocess.CalledProcessError:
            # netstat returns error if no match found (good)
            print("Port 8002 is CLEAN (No match).")
            break
        except Exception as e:
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    kill_port_8002()
