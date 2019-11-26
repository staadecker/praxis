classdef UserData
    properties
        timestamp
        bin_file
        data
        delay
    end
    
    methods
        function correct_data(obj)
            if obj.bin_file == "myhal_bin.svg"
                for i = 1:length(obj.data)
                    if strcmp(obj.data(i,3), "container")
                       
                    end
                end
            end
        end
    end
end

