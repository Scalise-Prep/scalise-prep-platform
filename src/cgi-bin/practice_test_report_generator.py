#Put my code library on Path:

#module_path = '/Users/karina/Dropbox/General/Tutoring/ACT_COURSE/jupyterCode/Functions'
#if module_path not in sys.path:
    sys.path.append(module_path)
#from ksSql import sqlInteract
#import json
#import datetime as dt
#import mysql.connector
#from prettytable import PrettyTable
#from mysql.connector import Error
import sys
from IPython.display import display, HTML
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

#Save fig
timingFigPath = "junkImage.png"
figH.savefig(timingFigPath)


#CREATE HTML REPORT
from jinja2 import FileSystemLoader, Environment
import base64
from io import BytesIO

#Turn timing fig into temporary byte encoded file based on instructions here https://stackoverflow.com/questions/48717794/matplotlib-embed-figures-in-auto-generated-html
tmpTimingFigfile = BytesIO()
timingFigH.savefig(tmpTimingFigfile, format='png', bbox_inches = 'tight',
    pad_inches = 0)
encodedTimingFig = base64.b64encode(tmpTimingFigfile.getvalue()).decode('utf8')

# Configure Jinja and ready the template
env = Environment(
    loader=FileSystemLoader(searchpath="")
)
template = env.get_template("../assignmentTemplates/report_template.html")


#Use Data and template to create html file
with open("report.html", "w") as f:
    f.write(template.render(titleStr = "title", compositeScore = "int(compositeScore)", minsSpent = "minsSpent", minsSpentOnWrongQuestions = "minsSpentOnWrongQuestions", summaryStrArray = "summaryStrArray", encodedTimingFig="encodedTimingFig", errorlogDf = "errorLog"))
    
print("this section complete")

#Convert html to pdf
import pdfkit
pdfkit.from_file('report.html', 'report.pdf')