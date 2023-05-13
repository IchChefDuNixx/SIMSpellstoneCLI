# %%
import time
import execjs


# Load SKILL_DATA
with open("C:\\Users\\Felix\\Desktop\\SIMSpellstone\\dist\\data.min.js", "r") as f:
    dependency_code = f.read()
    
# Load the Main JavaScript file
with open('C:\\Users\\Felix\\Desktop\\SIMSpellstone\\scripts\\shared_stripped.js', 'r') as f:
    main_code = f.read()

ctx = execjs.compile(dependency_code + main_code)

deck = [101]

t = time.time()
sim_result = ctx.call("hash_encode", deck)

print(time.time() - t)
sim_result