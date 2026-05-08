import matlab.engine
import pprint

print("Starting MATLAB Engine...")
eng = matlab.engine.start_matlab()
eng.cd(r"d:\7Sem\fyp\finalized\SLGrid\Final", nargout=0)

print("Loading model...")
eng.load_system('Sri_Lanka_S_FINAL', nargout=0)

print("Finding all top-level blocks...")
eng.eval("blocks = find_system('Sri_Lanka_S_FINAL', 'SearchDepth', 1);", nargout=0)
blocks = eng.workspace['blocks']

print("Top level blocks:")
for b in blocks:
    print(b)

eng.quit()
