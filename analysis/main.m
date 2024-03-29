clc
clear

%% Get DATA


PATH = "C:\Users\machs\Documents\praxis_data\praxis-i-research.appspot.com\user\";
CUT_OFF_TIME = 15000;

categories = categorical({'Control', 'Improved Labelling', 'Bin Delay', 'Improved Slot Size'});
categories = reordercats(categories, {'Control', 'Improved Labelling', 'Bin Delay', 'Improved Slot Size'});


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

%subplot(3,2,1)
plot_categories(data, categories);
%subplot(3,2,2)
plot_average_time_per_item(data, categories);
%subplot(3,2,3)
plot_time_per_case(split_data, categories)
%subplot(3,2,4)
plot_reaction_time_per_slot(split_data, categories)
%subplot(3,2,5)
plot_contamination_rate(split_data, categories)

function plot_average_time_per_item(split_data, categories)
sample_cat = split_data(1) ;
time_for_item = zeros(4,height(sample_cat(1).data));

for cur_case = 1:4
for item = 1:length(time_for_item)
    time_for_item(cur_case, item) = mean(arrayfun(@(user) user.data{item,1}, split_data(cur_case)));
end
end

plot(1:length(time_for_item),time_for_item)
xlabel("Item number")
ylabel("Reaction time (ms)")
legend(cellstr(categories))
title("Reaction time as trial progresses")

saveas(gcf, 'results/reaction_time_per_item.png')

end

function plot_contamination_rate(split_data, categories)
time = zeros(size(split_data));

for i = 1:length(split_data)
    time(i) = mean(arrayfun(@(user) user.get_contamination_rate(), split_data{i}));
end

b=bar(categories, time);
show_labels_on_bar_chart(b)
ylabel("Occurence of mistakes (%)")
title("Occurence of mistakes for each test case")

saveas(gcf, 'results/occurence_of_mistakes.png')

end

function plot_time_per_case(split_data, categories)
time = zeros(size(split_data));

for i = 1:length(split_data)
    time(i) = mean(arrayfun(@(user) mean(user.data{:,1}), split_data{i}));
end

time = time - time(1);

b=bar(categories, time);
show_labels_on_bar_chart(b)
ylabel("Change in Reaction Time (ms)")
title("Change in reaction time for each test case")

saveas(gcf, 'results/reaction_time.png')

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

saveas(gcf, fullfile("results/respondents.png"))


end

function plot_reaction_time_per_slot(split_data, categories)

result = zeros(length(split_data), 4); %Case type in each row

binCategories = categorical({'garbage', 'coffee', 'paper', 'container'});

for case_type = 1:length(split_data)
    for i = 1:4
        result(case_type, i) = mean(rmmissing(arrayfun(@(trial) trial.average_time_for_category(char(binCategories(i))), split_data{case_type})));
    end
end

bar(binCategories, result);
legend(cellstr(categories), 'Location', 'bestoutside')
xlabel("Slot")
ylabel("Reaction time (ms)")
title("Reaction time for each slot")

saveas(gcf, 'results/reaction_time_per_slot.png')

end

function show_labels_on_bar_chart(b)
text(1:length(b.YData),b.YData,num2str(round(b.YData')),'vert','bottom','horiz','center');
end