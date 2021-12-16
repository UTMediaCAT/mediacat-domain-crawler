# cleanUpTmp
This script can be used to periodically clear up the `/tmp` directory in order to prevent it from filling up while crawling.
## Usage: 
- Start a new [screen session](https://linuxize.com/post/how-to-use-linux-screen/) to run this in the background, `screen -S screenName`
- Run `python3 cleanUpTmp.py limit` where `limit` is the maximum allowable size of `tmp` in kilobytes. 
    - Whenever the size of `/tmp` exceeds `limit` the older files are deleted.
- Dettach from the screen `^a` then `d`

**WARNING** This script will delete all old files in `/tmp` so make sure there is nothing you need before running. 