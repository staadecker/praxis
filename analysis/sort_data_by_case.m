function data = sort_data_by_case(data)

control = UserData.empty();
good = UserData.empty();
slot = UserData.empty();
delay =UserData.empty();

for i= 1:length(data)
    switch data(i).bin_file
        case "good_bin.svg"
            good(length(good)+1) = data(i);
        case "myhal_bin.svg"
            if data(i).delay
                delay(length(delay)+1) = data(i);
            else
                control(length(control) +1) = data(i);
            end
        case "slot_bin.svg"
            slot(length(slot) +1) = data(i);
    end
end

data = {control, good, delay, slot};

end

