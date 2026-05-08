import matlab.engine
import os
import sys

print("Starting MATLAB...")
eng = matlab.engine.start_matlab()
eng.cd(r"d:\7Sem\fyp\finalized\SLGrid\Final", nargout=0)

print("Running parameter script...")
eng.eval("Sri_Lanka_FINAL", nargout=0)

print("Loading model...")
eng.load_system('Sri_Lanka_S_FINAL', nargout=0)

print("Configuring scopes for logging...")
eng.set_param('Sri_Lanka_S_FINAL/Frequecy Response', 'SaveToWorkspace', 'on', nargout=0)
eng.set_param('Sri_Lanka_S_FINAL/Frequecy Response', 'SaveName', 'freq_out', nargout=0)
eng.set_param('Sri_Lanka_S_FINAL/Frequecy Response', 'DataFormat', 'Array', nargout=0)

eng.set_param('Sri_Lanka_S_FINAL/ROCOF', 'SaveToWorkspace', 'on', nargout=0)
eng.set_param('Sri_Lanka_S_FINAL/ROCOF', 'SaveName', 'rocof_out', nargout=0)
eng.set_param('Sri_Lanka_S_FINAL/ROCOF', 'DataFormat', 'Array', nargout=0)

print("Setting disturbance to 0.1 pu...")
eng.set_param('Sri_Lanka_S_FINAL/LOad Disturbance', 'After', '0.1', nargout=0)

print("Running simulation...")
# Run simulation and capture output in a variable called 'out'
eng.eval("out = sim('Sri_Lanka_S_FINAL');", nargout=0)

print("Extracting data...")
# Extracting data from the SimulationOutput object
# `out.tout` for time, `out.freq_out` for frequency
eng.eval("t = out.tout;", nargout=0)
eng.eval("f = out.freq_out;", nargout=0)
eng.eval("r = out.rocof_out;", nargout=0)

t = eng.workspace['t']
f = eng.workspace['f']
r = eng.workspace['r']

print("Simulation finished. Data shapes:")
print("t:", len(t))
print("f:", len(f))
print("r:", len(r))
print("First few f values:", f[0][:5] if len(f) > 0 else "Empty")

eng.quit()
print("Success!")
