function(ids, groups) {
  var numbers = [];
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    for (var j = 0; j < group.points.length; j++) {
      numbers.push(group.points[j].number);
    }
  }
  if (numbers.length == 0) return;

  var cells = $(groups[0].cell).parent().find('td');
  var rowHeight = cells[0].offsetHeight;
  var rowLeft = cells[0].offsetLeft;
  var lastCell = cells[cells.length - 1];
  var rowRight = lastCell.offsetLeft + lastCell.offsetWidth;
  var rowWidth = rowRight - rowLeft;

  var svg = $(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg')).css({
    'position': 'absolute',
    'top': 0,
    'left': 0,
    'width': rowWidth + 'px',
    'height': rowHeight + 'px',
    'pointer-events': 'none',
    'background': 'rgba(200,200,180,0.2)'
  });
  var svgLeft = $(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg')).css({
    'position': 'absolute',
    'top': 0,
    'right': 0,
    'width': '100px',
    'height': '100%',
    'pointer-events': 'none'
  });

  var ylow = Math.floor(Math.min.apply(null, numbers));
  var yhigh = Math.ceil(Math.max.apply(null, numbers) + 0.1);
  var yspan = yhigh - ylow;
  // we only want a maximum of 5 grid lines
  var gridspacing = Math.ceil(yspan / 5);

  function getY(number) {
    var frac = (number - ylow)/yspan;
    return rowHeight*(0.9 - frac*0.7);
  }

  for (var gridY = ylow; gridY <= yhigh; gridY+=gridspacing) {
    var y = getY(gridY);
    svg.append($(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({
      'd': 'M0,' + y + ',' + rowWidth + ',' + y,
      'stroke': 'rgba(0, 0, 0, 0.1)',
      'stroke-width': 1,
      'fill': 'transparent'
    }));
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.appendChild(document.createTextNode(gridY));
    // x and y cannot be set by attr(), but the rest can.
    text.setAttribute('x', 90); // right-aligned within 100px width
    text.setAttribute('y', y + 4);
    svgLeft.append($(text).attr({
      'text-anchor': 'end',
      'font-family': 'Roboto',
      'font-size': '1.4rem',
      'fill': 'rgba(0, 0, 0, 0.5)',
      'stroke-width': 0
    }));
  }

  // plot the data points
  coords = '';
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var xlow = group.start;
    var xspan = group.stop - group.start;
    for (var j = 0; j < group.points.length; j++) {
      var xfrac = (group.points[j].time - xlow)/xspan;
      var x = group.cell.offsetLeft - rowLeft + group.cell.offsetWidth*xfrac;
      var y = getY(group.points[j].number);
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      // cx, cy, and r cannot be set by attr(), but fill and stroke-width can.
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', 1);
      svg.append($(c).attr({
        'fill': '#000',
        'stroke-width': 0
      }));
      coords += ',' + x + ',' + y;
    }
  }
  // draw lines between the data points
  svg.append($(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({
    'd': 'M' + coords.substring(1),
    'stroke': '#000',
    'stroke-width': 2,
    'fill': 'transparent'
  }));

  $(cells[0]).css({'position': 'relative'}).append(svg);
  $(cells[0]).parent().find('th').css({'position': 'relative'}).append(svgLeft);
}