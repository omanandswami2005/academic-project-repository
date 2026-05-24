import os
import glob
import json
import re
import pandas as pd

data_dir = r"c:\Users\omana\Projects\academic-project-repo-system\data"
out_path = r"c:\Users\omana\Projects\academic-project-repo-system\server\src\db\normalized_data.json"

normalized_projects = []

def clean_str(val):
    if pd.isna(val):
        return None
    val_str = str(val).strip()
    # Remove weird characters like non-breaking spaces or double-slashes
    val_str = re.sub(r'\s+', ' ', val_str)
    return val_str if val_str else None

def clean_prn(val):
    val_str = clean_str(val)
    if not val_str:
        return None
    # Typos like RbT to RBT
    val_str = re.sub(r'^[Rr][Bb][Tt]', 'RBT', val_str)
    # Remove spaces
    val_str = val_str.replace(" ", "")
    # Check if looks like a PRN (starts with RBT or RBTL)
    if val_str.startswith("RBT") or val_str.startswith("RBTL"):
        return val_str
    return val_str # return anyway, will clean in seeder

print("Starting Stage 1: Excel Normalization using Python...")

# ==========================================
# 1. PARSE CIVIL.XLSX
# ==========================================
civil_path = os.path.join(data_dir, "Civil.xlsx")
if os.path.exists(civil_path):
    print("Parsing Civil.xlsx...")
    # Row 0 is Group No., Roll No., PRN, Name of Students, Titles
    df = pd.read_excel(civil_path, sheet_name=0, header=1) # read starting row 1
    
    current_project = None
    
    for idx, row in df.iterrows():
        # Clean columns
        group_val = clean_str(row.get("Group No."))
        title_val = clean_str(row.get("Titles"))
        prn_val = clean_prn(row.get("PRN"))
        name_val = clean_str(row.get("Name of Students"))
        roll_val = clean_str(row.get("Roll No."))
        div_val = clean_str(row.get("Division"))
        
        # If we have name and PRN, it is a student row
        if name_val or prn_val:
            # If a new group number or title is specified, create a new project
            if group_val is not None or title_val is not None:
                if current_project:
                    normalized_projects.append(current_project)
                current_project = {
                    "branch": "CIVIL",
                    "groupNo": group_val or f"CIVIL-G{idx}",
                    "title": title_val or "Civil Engineering Capstone Project",
                    "guide": None, # Civil sheet doesn't seem to have a Guide column in sample
                    "completionRate": 0.0,
                    "members": []
                }
            
            # If we don't have a project yet (e.g. initial rows), create a fallback
            if not current_project:
                current_project = {
                    "branch": "CIVIL",
                    "groupNo": "CIVIL-G_fallback",
                    "title": title_val or "Civil Engineering Capstone Project",
                    "guide": None,
                    "completionRate": 0.0,
                    "members": []
                }
                
            current_project["members"].append({
                "name": name_val,
                "prn": prn_val,
                "rollNo": roll_val,
                "div": div_val
            })
            
            # If the title is set on a row that didn't start a group, populate it
            if title_val and not current_project["title"]:
                current_project["title"] = title_val

    if current_project:
        normalized_projects.append(current_project)

# ==========================================
# 2. PARSE CSBS.XLSX
# ==========================================
csbs_path = os.path.join(data_dir, "CSBS.xlsx")
if os.path.exists(csbs_path):
    print("Parsing CSBS.xlsx...")
    df = pd.read_excel(csbs_path, sheet_name=0) # starts directly at row 0
    
    current_project = None
    
    for idx, row in df.iterrows():
        gr_id = clean_str(row.get("GR ID"))
        topic = clean_str(row.get("Topic"))
        guide = clean_str(row.get("Guide Name"))
        name = clean_str(row.get("Name Of Student"))
        rbt_no = clean_prn(row.get("RBT NO"))
        github = clean_str(row.get("Github Link for project"))
        
        # Completion Rate
        comp_val = row.get("Implementation of Project(in %)(30)")
        comp_rate = 0.0
        try:
            if pd.notna(comp_val):
                # E.g. 0.6 or 60 or 80.0
                val = float(comp_val)
                if val > 1.0:
                    comp_rate = val / 100.0
                else:
                    comp_rate = val
        except:
            pass
            
        if name or rbt_no:
            if gr_id is not None or topic is not None:
                if current_project:
                    normalized_projects.append(current_project)
                current_project = {
                    "branch": "CSBS",
                    "groupNo": str(int(float(gr_id))) if gr_id and gr_id.replace('.','',1).isdigit() else str(gr_id),
                    "title": topic or "Computer Science and Business Systems Project",
                    "guide": guide,
                    "completionRate": comp_rate,
                    "github": github,
                    "members": []
                }
            
            if not current_project:
                current_project = {
                    "branch": "CSBS",
                    "groupNo": "CSBS-G_fallback",
                    "title": topic or "Computer Science and Business Systems Project",
                    "guide": guide,
                    "completionRate": comp_rate,
                    "github": github,
                    "members": []
                }
                
            current_project["members"].append({
                "name": name,
                "prn": rbt_no,
                "rollNo": None,
                "div": None
            })
            if guide and not current_project["guide"]:
                current_project["guide"] = guide
            if topic and not current_project["title"]:
                current_project["title"] = topic
            if github and "github" not in current_project:
                current_project["github"] = github

    if current_project:
        normalized_projects.append(current_project)

# ==========================================
# 3. PARSE E&TC.XLSX
# ==========================================
etc_path = os.path.join(data_dir, "E&TC.xlsx")
if os.path.exists(etc_path):
    print("Parsing E&TC.xlsx...")
    # Sheet 'Final 25-08-2025' has 7 columns: GROUP NO, Roll No., Div, PRN, Student Name, Allocated Guide, Project Title
    # Row 5 is header, so header=5
    df = pd.read_excel(etc_path, sheet_name="Final 25-08-2025", header=5)
    
    current_project = None
    
    for idx, row in df.iterrows():
        group_no = clean_str(row.get("GROUP NO"))
        roll_no = clean_str(row.get("Roll No."))
        div = clean_str(row.get("Div"))
        prn = clean_prn(row.get("PRN"))
        student_name = clean_str(row.get("Student Name"))
        guide = clean_str(row.get("Allocated Guide"))
        title = clean_str(row.get("Project  Title"))
        
        if student_name or prn:
            if group_no is not None or title is not None:
                if current_project:
                    normalized_projects.append(current_project)
                current_project = {
                    "branch": "E&TC",
                    "groupNo": group_no,
                    "title": title or "E&TC Engineering Project",
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            if not current_project:
                current_project = {
                    "branch": "E&TC",
                    "groupNo": "ETC-G_fallback",
                    "title": title or "E&TC Engineering Project",
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            current_project["members"].append({
                "name": student_name,
                "prn": prn,
                "rollNo": roll_no,
                "div": div
            })
            if guide and not current_project["guide"]:
                current_project["guide"] = guide
            if title and not current_project["title"]:
                current_project["title"] = title

    if current_project:
        normalized_projects.append(current_project)

# ==========================================
# 4. PARSE IT.XLSX
# ==========================================
it_path = os.path.join(data_dir, "IT.xlsx")
if os.path.exists(it_path):
    print("Parsing IT.xlsx...")
    # Row 9 contains actual headers: Group No.:, PRN, Roll No., Name of the Students, Guide Name, Topic Name
    df = pd.read_excel(it_path, sheet_name=0, header=9)
    
    current_project = None
    
    for idx, row in df.iterrows():
        group_no = clean_str(row.get("Group No.:"))
        prn = clean_prn(row.get("PRN"))
        roll_no = clean_str(row.get("Roll No."))
        name = clean_str(row.get("Name of the Students"))
        guide = clean_str(row.get("Guide Name"))
        topic = clean_str(row.get("Topic Name"))
        
        if name or prn:
            if group_no is not None or topic is not None:
                if current_project:
                    normalized_projects.append(current_project)
                current_project = {
                    "branch": "IT",
                    "groupNo": group_no,
                    "title": topic or "Information Technology Capstone Project",
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            if not current_project:
                current_project = {
                    "branch": "IT",
                    "groupNo": "IT-G_fallback",
                    "title": topic or "Information Technology Capstone Project",
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            current_project["members"].append({
                "name": name,
                "prn": prn,
                "rollNo": roll_no,
                "div": None
            })
            if guide and not current_project["guide"]:
                current_project["guide"] = guide
            if topic and not current_project["title"]:
                current_project["title"] = topic

    if current_project:
        normalized_projects.append(current_project)

# ==========================================
# 5. PARSE MECHANICAL.XLSX
# ==========================================
mech_path = os.path.join(data_dir, "Mechanical.xlsx")
if os.path.exists(mech_path):
    print("Parsing Mechanical.xlsx...")
    # Row 4 contains headers: Group No, Name of students, Roll No, PRN No., Contact Number, Email ID, Project Guide
    df = pd.read_excel(mech_path, sheet_name=0, header=4)
    
    current_project = None
    
    for idx, row in df.iterrows():
        group_no = clean_str(row.get("Group No"))
        name = clean_str(row.get("Name of students"))
        roll_no = clean_str(row.get("Roll No"))
        prn = clean_prn(row.get("PRN No."))
        guide = clean_str(row.get("Project Guide"))
        email = clean_str(row.get("Email ID"))
        phone = clean_str(row.get("Contact Number"))
        
        if name or prn:
            if group_no is not None or guide is not None:
                if current_project:
                    # Resolve placeholder title
                    g_no = current_project["groupNo"]
                    g_name = current_project["guide"] or "TBD"
                    current_project["title"] = f"Mechanical Engineering Capstone Project - Group {g_no} (Guide: {g_name})"
                    normalized_projects.append(current_project)
                current_project = {
                    "branch": "MECH",
                    "groupNo": group_no,
                    "title": None, # will populate at save
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            if not current_project:
                current_project = {
                    "branch": "MECH",
                    "groupNo": "MECH-G_fallback",
                    "title": None,
                    "guide": guide,
                    "completionRate": 0.0,
                    "members": []
                }
                
            current_project["members"].append({
                "name": name,
                "prn": prn,
                "rollNo": roll_no,
                "div": None,
                "email": email,
                "phone": phone
            })
            if guide and not current_project["guide"]:
                current_project["guide"] = guide

    if current_project:
        g_no = current_project["groupNo"]
        g_name = current_project["guide"] or "TBD"
        current_project["title"] = f"Mechanical Engineering Capstone Project - Group {g_no} (Guide: {g_name})"
        normalized_projects.append(current_project)

# Ensure DB folder exists
os.makedirs(os.path.dirname(out_path), exist_ok=True)

# Write to JSON file
with open(out_path, "w", encoding="utf-8") as out:
    json.dump(normalized_projects, out, indent=2, ensure_ascii=False)

print(f"\nStage 1 COMPLETE: Successfully normalized {len(normalized_projects)} projects into {out_path}!")
