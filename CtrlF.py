# %%
import os
import glob
import re

folder_path = "C:\\Users\\Felix\\Desktop\\SIMSpellstone"
search_pattern = r"\bshared_stripped\b"

# Keep track of the files that have already been searched
searched_files = set()

# Iterate over all JavaScript files in the directory
for filepath in glob.glob(os.path.join(folder_path, "**", "*.js"), recursive=True):

    with open(filepath, "r") as file:
        # Read the file contents
        contents = file.read()
        # Search for the pattern using regular expressions
        matches = re.findall(search_pattern, contents)
        # If the pattern is found, print the filename and the line number(s) where it appears
        if matches:
            print(f"{filepath}:")
            match = matches[0]
            lines = [i+1 for i in range(len(contents.split("\n"))) if match in contents.split("\n")[i]]
            print(f"  Found '{match}' on line(s) {', '.join(map(str, lines))}")
# %%
import time
import execjs

t = time.time()
# Load SKILL_DATA
with open("C:\\Users\\Felix\\Desktop\\SIMSpellstone\\dist\\data.min.js", "r") as f:
    dependency_code = f.read()

# Load the Main JavaScript file
with open('C:\\Users\\Felix\\Desktop\\SIMSpellstone\\dist\\simulator_stripped.js', 'r') as f:
    main_code = f.read()

ctx = execjs.compile(dependency_code + main_code)

deck1 = "ov!AAUAcFFdsR4HdsR4HduEEFdsR4HN40wHN40wHN40wHdsR4HFW1DFdsR4Hkcw4Hkcw4Hkcw4Hkp~FF"
deck2 = "ov!AAUAcFFdsR4HdsR4HduEEFdsR4HN40wHN40wHN40wHdsR4HFW1DFdsR4Hkcw4Hkcw4Hkcw4Hkp~FF"
use_tower = True
bge_id1 = "164"
bge_id2 = "165"
numsims = 1000

sim_result = ctx.call("SIM_CONTROLLER.startsim", deck1, deck2, use_tower, bge_id1, bge_id2, numsims)
# sim_result["duration"] = time.time() - t
# sim_result
# %%
