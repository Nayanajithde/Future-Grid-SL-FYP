import matlab.engine
import os
import sys

print("Starting MATLAB engine...")
eng = matlab.engine.start_matlab()

# Navigate to the correct directory
model_dir = r"d:\7Sem\fyp\finalized\SLGrid\Final"
eng.cd(model_dir, nargout=0)

print("Loading model...")
eng.load_system('Sri_Lanka_S_FINAL', nargout=0)

print("Finding Step blocks...")
step_blocks = eng.find_system('Sri_Lanka_S_FINAL', 'BlockType', 'Step')
print("Step blocks:", step_blocks)

print("Finding Scope blocks...")
scope_blocks = eng.find_system('Sri_Lanka_S_FINAL', 'BlockType', 'Scope')
print("Scope blocks:", scope_blocks)

print("Finding Outport or ToWorkspace blocks...")
toworkspace_blocks = eng.find_system('Sri_Lanka_S_FINAL', 'BlockType', 'ToWorkspace')
print("ToWorkspace blocks:", toworkspace_blocks)

outport_blocks = eng.find_system('Sri_Lanka_S_FINAL', 'BlockType', 'Outport')
print("Outport blocks:", outport_blocks)

eng.quit()
print("Done.")
