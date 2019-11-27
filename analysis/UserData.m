classdef UserData
    properties
        timestamp
        bin_file
        data
        delay
    end
    
    methods
        function correct_data(obj)
            % The ids in the myhal_bin.svg were switched for container and coffee
            % so we unswitch them here.
            if obj.bin_file == "myhal_bin.svg"
                for i = 1:height(obj.data)
                    if strcmp(obj.data{i,3}, "container")
                       obj.data(i, 3) = {'coffee'};
                    elseif strcmp(obj.data(i,3), "coffee")
                        obj.data(i, 3) = {'container'};
                    end
                end
            end
        end
        
        function obj = remove_first_item(obj)
            obj.data = obj.data(2:height(obj.data),:);
        end
        
        function r = is_bad_trial(obj, maximum_time)
            r = any(arrayfun(@(time) time > maximum_time, table2array(obj.data(:,1))));
        end
        
        function r = average_time_for_category(obj, category)
            is_category = arrayfun(@(cat) strcmp(cat, category), table2array(obj.data(:, 3)));
            r = mean(table2array(obj.data(is_category, 1)));
        end
        
        function r = get_contamination_rate(obj)
            is_wrong = 0;
            for i = 1:height(obj.data)
                if ~strcmp(get_correct_bin(char(obj.data{i, 2})), char(obj.data{i, 3}))
                    is_wrong = is_wrong + 1;
                end
            end
            
            r = is_wrong / height(obj.data) * 100;
        end
    end
end

