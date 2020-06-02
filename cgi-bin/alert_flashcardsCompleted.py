#!/usr/bin/python
# The above is needed to run script at Cron Job, also make sure to set permissions to 744

from runQuery import runQuery
import time
import numpy as np

#Set time back to look
daysBackToLook=1/23#look back a little more than an hour so that if check every hour I wont miss anything
threshEpoch = int(time.time()-(daysBackToLook*3600*24))


#Pull students with flashcards completed in the last timeIvl with number completed, number of those on hold

rightGood = "WHEN (f.correctStreak > 0 AND f.hold = 0)"
rightHold = "WHEN (f.correctStreak > 0 AND f.hold = 1)"
wrongGood = "WHEN (f.correctStreak = 0 AND f.hold = 0)"
wrongHold = "WHEN (f.correctStreak = 0 AND f.hold = 1)"
#statusColumnSql = f"(CASE {rightGood} {rightHold} {wrongGood} {wrongHold} END)"

q = '''SELECT u.username AS username,
           COUNT(DISTINCT f.flashcardId) AS Total,
           SUM(CASE {rightGood} THEN 1 ELSE 0 END) AS PASSright,
           SUM(CASE {wrongGood} THEN 1 ELSE 0 END) AS PASSwrong,
           SUM(CASE {rightHold} THEN 1 ELSE 0 END) AS HOLDright,    
           SUM(CASE {wrongHold} THEN 1 ELSE 0 END) AS HOLDwrong
        FROM myAssignments.flashcard AS f
        LEFT JOIN myMembers.username AS u
        ON u.id = f.userId
        WHERE (f.numAttempts > 0 AND f.latestAttemptDate > {threshEpoch})
        GROUP By username
        ;
        '''.format(rightGood = rightGood, wrongGood = wrongGood, rightHold = rightHold, wrongHold=wrongHold, threshEpoch=threshEpoch )
try:
    qr, tableObj = runQuery(q)
except:
    print("running query failed")

try:
    #Print output (if result isn't empty)
    if not not qr:
        timeObj = time.localtime(time.time())
        introString = "Today is %d-%d-%d\n\nIn the last %d days, these students completed flashcards!" % (timeObj.tm_year, timeObj.tm_mon, timeObj.tm_mday, daysBackToLook)
        print(introString)
        for row in qr:
            print("---------------")    
            print(" - {username}: {Total} completed -- {nHOLD} paused ({nHOLDright} right|{nHOLDwrong} wrong)".format(username = row[0],Total = row[1],nHOLD=(row[4]+row[5]), nHOLDright = row[4], nHOLDwrong = row[5]))

except:
    print("printing results failed")