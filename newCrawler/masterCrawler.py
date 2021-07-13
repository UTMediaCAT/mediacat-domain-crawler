# masterCrawler.py
#   Author: Raiyan Rahman
#   Date: June 28th, 2021
#   Description: Script starting and restarting the crawler after
#   the specified time intervals.
#   Parameters: -l : links separated by spaces
#               -f : csv file containing the scope
#               -n : number of pages to crawl per round for each domain (default is 5)
#               -r : the maximum number of rounds
#               -pdf : use this parameter if PDFs are to be saved
#               -t : the amount of time to wait in minutes
#   Usage: "python3 masterCrawler.py batchCrawl.js -f full_scope.csv"
#          "python3 masterCrawler.py batchCrawl.js -n 10 -f full_scope.csv"
#          "python3 masterCrawler.py batchCrawl.js -r 5 -f full_scope.csv"
#          "python3 masterCrawler.py batchCrawl.js -pdf -f full_scope.csv"
#          "python3 masterCrawler.py batchCrawl.js -l https://www.nytimes.com/ https://cnn.com/"

import os
import time
import pathlib
import argparse
import subprocess

# Create the argument parser.
parser = argparse.ArgumentParser(description='Crawler parameters.')
parser.add_argument('-l', type=str, nargs='*')
parser.add_argument('-f', type=pathlib.Path)
parser.add_argument('-n', type=int, default=5)
parser.add_argument('-r', type=int)
parser.add_argument('-pdf', action='store_true')
parser.add_argument('-t', type=int, default=1440)
parser.add_argument('crawlerFile', type=pathlib.Path)
# Args object now contains the args as properties.
args = parser.parse_args()

# Create the command to start the crawler with the given parameters.
command = f'node {args.crawlerFile} '
# Add the arguments.
if args.n != 5:
    command += f'-n {args.n} '
if args.r is not None:
    command += f'-r {args.r} '
if args.pdf:
    command += '-pdf '
# Add the domains to the command.
if args.f is None:
    command += f"-l {' '.join(args.l)}"
else:
    command += f'-f {args.f}'
print(f'Command constructed: {command}')

def refreshLogs() -> None:
    """
    Move the debug log to a directory named logs and rename it to a timestamp.
    """
    # Check if the logs directory exists.
    if not os.path.isdir('logs'):
        os.mkdir('logs')
    timestamp = time.strftime('%Y-%m-%d_%H-%M-%S')
    # Rename and move the debug log to the logs directory.
    os.rename('debug.log', f'logs/{timestamp}.log')
    return

# Infinite loop.
while True:
    # Start the process
    p = subprocess.Popen(command.split(' '))
    # Let the crawler run for the specified number of minutes.
    time.sleep(args.t * 60)
    # SIGKILL the process.
    p.kill()
    # Wait for the process to terminate.
    returncode = p.wait()
    print(f'Process {p.pid} returned code {returncode}')
    refreshLogs()
