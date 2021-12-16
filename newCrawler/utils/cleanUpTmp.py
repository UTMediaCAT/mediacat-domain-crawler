import os
import shutil
import sys
import time
def clean():
    toDelete = os.popen('ls -t /tmp | head -500').read().split('\n')
    latest = os.popen('ls -t /tmp | head -1').read().split('\n')[0]
    print('before:')
    os.system('du -sh /tmp')
    for d in toDelete:
        if d != '' and d != latest:
            #print('removing', d)
            try:
                shutil.rmtree('/tmp/' + d)
            except Exception:
                print('Could not find ' + d)
    print('after:')
    os.system('du -sh /tmp')


if __name__ == '__main__':
    if len(sys.argv) == 1:
        clean()
    elif len(sys.argv) == 2:
        limit = int(sys.argv[1])
        while True:
            curr_size = int(os.popen('du -s /tmp').read().split('\t')[0])
            print('current size is', curr_size, 'limit set to', limit)
            if curr_size >= limit:
                print('cleaning')
                clean()
            time.sleep(300)
    
