#!/usr/bin/python

#The above is a header to tell godaddy where to find python installation (may or may not be necessary)
try:
    import numpy as np
    import time
    from runQuery import runQuery
except:
    print("module import failed")

#Set Selection Parameters
try:
    daysBackToLook=1/23.0 #look back a little more than an hour so that if check every hour I wont miss anything
    maxSelect = 100 #maximum assignments to select, most recent first
    #Modify Parameters for Use
    threshEpoch = np.round(time.time()-(daysBackToLook*3600*24))
except:
    print("setting parameters failed")

try:
    #Run Query
    q = '''
    SELECT FROM_UNIXTIME(ast.timestamp,"%Y-%m-%d") AS dateChanged, ua.assignmentId AS assignID, al.lessonID, un.username, ln.lessonTitle, ast.status
    FROM myAssignments.assignStatus ast
    LEFT JOIN myAssignments.assignUser ua
    ON ast.assignmentId = ua.assignmentId
    LEFT JOIN myMembers.username un
    ON un.id = ua.userId
    LEFT JOIN myAssignments.assignStartDate asd
    ON asd.assignmentId = ua.assignmentId
    LEFT JOIN myAssignments.assignLesson al
    ON ua.assignmentId = al.assignmentId
    LEFT JOIN myAssignments.lessonTitle ln
    ON al.lessonId = ln.lessonId
    WHERE ast.timestamp > {0}
    ORDER BY un.username, ast.timestamp DESC
    LIMIT {1}
    ;
    '''.format(threshEpoch, maxSelect)
    qr, tableObj = runQuery(q)
except:
    print("running query failed")

try:
    #Print output (if result isn't empty)
    if not not qr:
        timeObj = time.localtime(time.time())
        introString = "Today is %d-%d-%d\nIn the last %d days, these assignments had status changes:" % (timeObj.tm_year, timeObj.tm_mon, timeObj.tm_mday, daysBackToLook)
        print(introString)
        print(tableObj)
except:
    print("printing results failed")

