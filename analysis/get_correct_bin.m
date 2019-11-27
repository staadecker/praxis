function correct_bin = get_correct_bin(item)
garbage = 'garbage';

switch item
    case 'apple.png'
        correct_bin = garbage;
    case 'coffee lid.jpg'
        correct_bin = 'container';
    case 'coffee paper cup.jpeg'
        correct_bin = 'coffee';
    case 'eggshells.jpg'
        correct_bin = garbage;
    case 'elastic bands.jpg'
        correct_bin = garbage;
    case 'milk.png'
        correct_bin = garbage;
    case 'paper.png'
        correct_bin = 'paper';
    case 'pizza box.jpg'
        correct_bin = 'paper';
    case 'snickers.png'
        correct_bin = garbage;
    case 'tea bag.jpg'
        correct_bin = garbage;
        
end
end

