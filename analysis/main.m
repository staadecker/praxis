clc
clear

%% Get DATA


PATH = "C:\Users\machs\Documents\praxis_data\praxis-i-research.appspot.com\user\";
CUT_OFF_TIME = 15000;

categories = categorical({'Control bins', 'New labels', 'Control bins with delay', 'New slot shapes'});
categories = reordercats(categories, {'Control bins', 'New labels', 'Control bins with delay', 'New slot shapes'});


data = get_users_data(PATH);

for i = 1:length(data)
    data(i).correct_data()
    %data(i) = data(i).remove_first_item();
end

logic = arrayfun(@(trial) ~trial.is_bad_trial(CUT_OFF_TIME), data);
data = data(logic);

split_data = sort_data_by_case(data);

%% Plot
close

subplot(3,1,1)
plot_categories(data, categories);
subplot(3,1,2)
plot_average_time_per_item(data, categories);
subplot(3,1,3)
plot_time_per_case(split_data, categories)

function plot_average_time_per_item(split_data, categories)

time_for_item = zeros(4,10);

for cur_case = 1:4
for item = 1:length(time_for_item)
    time_for_item(cur_case, item) = mean(arrayfun(@(user) user.data{item,1}, split_data(cur_case)));
end
end

plot(1:length(time_for_item),time_for_item)
xlabel("Item number disposed")
ylabel("Reaction time")
legend(cellstr(categories))

end

function plot_time_per_case(split_data, categories)
time = zeros(size(split_data));

for i = 1:length(split_data)
    time(i) = mean(arrayfun(@(user) mean(user.data{:,1}), split_data{i}));
end

time = time - time(1);

b=bar(categories, time);
show_labels_on_bar_chart(b)
ylabel("Time ")
end

function plot_categories(data, categories)

good = 0;
delay = 0;
control = 0;
slot = 0;

for i= 1:length(data)
    switch data(i).bin_file
        case "good_bin.svg"
            good = good + 1;
        case "slot_bin.svg"
            slot = slot + 1;
        case "myhal_bin.svg"
            if data(i).delay
                delay = delay +1;
            else
                control = control +1;
            end
    end
end

b = bar(categories, [control, good, delay, slot]);
ylabel("Number of participants")
title("Participants in experiment (total=" + length(data) + ")")
show_labels_on_bar_chart(b)


end

function show_labels_on_bar_chart(b)
for i = 1:length(b)
    text(1:length(b(i).YData),b(i).YData,num2str(b(i).YData'),'vert','bottom','horiz','center');
end
end



