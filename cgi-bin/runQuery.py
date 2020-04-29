import config
import time
import json
import datetime as dt
import mysql.connector
from mysql.connector import Error
from prettytable import PrettyTable

def runQuery(q): 
    #Connect to Godaddy 
    #Note to self: I have given KarinaPython permission to do most things on python databases, but if need full permissions need to go back on godaddy and change database access permissions for that username 
    try:
        connection = mysql.connector.connect(
          host=config.server,
          user=config.username,
          passwd=config.password,
        )
        if connection.is_connected():
            db_Info = connection.get_server_info()
            #print("Connected to MySQL Server version ", db_Info)
            cursor = connection.cursor()
            cursor.execute("select database();")
            record = cursor.fetchone()
            #print("You're connected to database: ", record)
    except Error as e:
        print("Error while connecting to MySQL", e)
        
    #Execute Query
    cursor.execute(q)
    qr = cursor.fetchall()
    outputTable = PrettyTable(cursor.column_names)
    for (row) in qr:
     outputTable.add_row(row)
    outputTable.align = "l"

        
    # Close connection to GoDaddy
    if (connection.is_connected()):
        cursor.close()
        connection.close()
       # print("MySQL connection is closed")
        
    #Return Query
    return qr, outputTable