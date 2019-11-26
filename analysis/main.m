clc
clear

%% Get DATA


PATH = "C:\Users\machs\Documents\praxis_data\praxis-i-research.appspot.com\user\";

data = get_users_data(PATH);

%% Plot
close

plot_categories(data);


function plot_categories(data)

good = 0;
delay = 0;
control = 0;

for i= 1:length(data)
    switch data(i).category
        case "good_bin.svg"
            good = good + 1;
        case "myhal_bin.svg"
            if data(i).delay
                delay = delay +1;
            else
                control = control +1;
            end
    end
end

X = categorical({'Control - MyHal bins w/o delay', 'Improved bins', 'MyHal bin with delay'});
X = reordercats(X, {'Control - MyHal bins w/o delay', 'Improved bins', 'MyHal bin with delay'});
bar(X, [control, good, delay])
legend
ylabel("Number of participants")
title("Participants in experiment (total=" + length(data) + ")")

end

