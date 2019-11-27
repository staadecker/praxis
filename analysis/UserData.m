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
    end
end

