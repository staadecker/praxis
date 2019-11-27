function data = load_user_data(filename)
opts = detectImportOptions(filename);
data = UserData;
data.data = readtable(filename, opts);

fileID = fopen(filename, 'r');
header= split(fgetl(fileID), ",");

fclose(fileID);


data.timestamp = str2double(header(1));
data.bin_file = char(header(2));

if strcmp(char(header(3)), 'true')
    data.delay = true;
else
    data.delay = false;
end

