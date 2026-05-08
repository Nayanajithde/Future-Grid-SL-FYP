import matlab.engine

print("Starting MATLAB...")
eng = matlab.engine.start_matlab()
eng.cd(r"d:\7Sem\fyp\finalized\SLGrid\Final", nargout=0)
eng.eval("Sri_Lanka_FINAL", nargout=0)
eng.load_system('Sri_Lanka_S_FINAL', nargout=0)

print("Running simulation for 2 seconds...")
eng.eval("out = sim('Sri_Lanka_S_FINAL', 'StopTime', '2');", nargout=0)

print("Checking what is in 'out'...")
try:
    eng.eval("out_vars = out.who;", nargout=0)
    out_vars = eng.workspace['out_vars']
    print("Variables in 'out':", out_vars)
except Exception as e:
    print("Could not get out.who:", e)
    try:
        eng.eval("out_vars = fieldnames(out);", nargout=0)
        out_vars = eng.workspace['out_vars']
        print("Variables in 'out' (fieldnames):", out_vars)
    except Exception as e2:
        pass

print("Checking base workspace variables...")
eng.eval("base_vars = evalin('base', 'who');", nargout=0)
base_vars = eng.workspace['base_vars']
print("Base workspace vars containing keywords:")
for v in base_vars:
    if 'freq' in v.lower() or 'rocof' in v.lower() or 'time' in v.lower() or 'out' in v.lower() or 't' == v.lower():
        print(" -", v)

print("Trying to inspect data structure...")
eng.eval("""
f_data = [];
try
    if exist('out', 'var') && isprop(out, 'freq_response')
        f_data = out.freq_response;
        disp('Found out.freq_response. Class:')
        disp(class(f_data))
    elseif exist('freq_response', 'var')
        f_data = freq_response;
        disp('Found freq_response in base. Class:')
        disp(class(f_data))
    else
        disp('Could not find freq_response anywhere.')
    end
catch e
    disp(e.message)
end

if ~isempty(f_data)
    disp('Size of f_data:')
    if isobject(f_data) || isstruct(f_data)
        disp('It is an object/struct.')
        if isa(f_data, 'timeseries')
            disp(['Timeseries Data Size: ', num2str(size(f_data.Data))])
        end
    else
        disp(size(f_data))
    end
end
""", nargout=0)

eng.quit()
