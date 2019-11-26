function users_data = get_users_data(PATH)
users_folders = dir(PATH);

users_data = UserData.empty(length(users_folders) -1, 0);

for i = 3:length(users_folders)
   filename = fullfile(PATH, users_folders(i).name, 'results.csv');
   users_data(i-2) = load_user_data(filename); 
end
end

