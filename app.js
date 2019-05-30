// Width and height
var chart_width = 800;
var chart_height = 600;

var color = d3.scaleQuantize().range([
    'rgb(49, 54, 149)', 'rgb(69, 117, 180)', 'rgb(116, 173, 209)',
    'rgb(171, 217, 233)', 'rgb(224, 243, 248)', 'rgb(255, 255, 191)',
    'rgb(254, 224, 144)', 'rgb(253, 174, 97)', 'rgb(244, 109, 67)',
    'rgb(215, 48, 39)', 'rgb(165, 0, 38)'
]);

// Projection
var projection = d3.geoMercator()
    .scale([130])
    .translate([chart_width / 2, chart_height / 1.5]);

//var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);


// Create SVG
var svg = d3.select("#chart")
    .append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

var drag_map = d3.drag().on('drag', function () {
    var offset = projection.translate();
    offset[0] += d3.event.dx;
    offset[1] += d3.event.dy;

    projection.translate(offset);

    svg.selectAll('path')
        .transition()
        .attr('d', path);
});

var map = svg.append('g')
    .attr('id', 'map')
    .call(drag_map);

map.append('rect')

// Data
var url = "https://project-caelum.herokuapp.com/data";
d3.json(url).then(function (temperature_data) {
    var updatedOn = document.getElementById('updatedOn');
    var label = document.createElement('label');
    label.innerHTML = "Updated on Coordinated Universal Time (UTC):" + temperature_data.updatedOn + ":00:00";
    updatedOn.append(label);
    console.log(temperature_data.updatedOn);
    console.log(temperature_data);
    console.log(temperature_data.Data)
    color.domain([-20, 50]);
    // color.domain([
    //     d3.min(temperature_data.Data, function (d) {
    //         return d.Temperature;
    //     }),
    //     d3.max(temperature_data.Data, function (d) {
    //         return d.Temperature;
    //     })
    // ]);
    d3.json("world_map.json").then(function (map_data) {
        map_data.features.forEach(function (map_e, map_i) {

            temperature_data.Data.forEach(function (temp_e, temp_i) {
                if (map_e.properties.name !== temp_e.Country) {
                    return null;
                }
                map_data.features[map_i].properties.temp = parseFloat(temp_e.Temperature);

            });
        });

        map.selectAll('path')
            .data(map_data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', function (d) {
                var tempe = d.properties.temp;
                return tempe ? color(tempe) : '#f7f7f7'; //#ddd
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5);
    });
});

d3.selectAll('#buttons button').on('click', function () {
    var offset = projection.translate();
    var distance = 50;
    var direction = d3.select(this).attr('class');

    if (direction == "up") { offset[1] += distance; }          //increase y offset
    else if (direction == "down") { offset[1] -= distance; }   //decrease y offset
    else if (direction == "left") { offset[0] += distance; }   //increase x offset
    else if (direction == "right") { offset[0] -= distance; }  //decrese x offset

    projection.translate(offset);

    svg.selectAll('path')
        .transition()
        .attr('d', path);

});