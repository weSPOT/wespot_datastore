exports.index = function(req, res){
    res.render('index', { title: 'test',description : 'test',
                    author: 'HCI'});
};
