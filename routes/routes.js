module.exports = function(express, app, passport,config, rooms){
  var router = express.Router();

    router.get('/',function(req,res,next){
       res.render('index',{title:'hulk hogan'});
    });

    function securePages(req,res,next){
        if (req.isAuthenticated()){                                               // isAuthenticated is true if "logged in" in passport session.
            next();
        } else {
            res.redirect('/');
        }
    }

    router.get('/auth/facebook',passport.authenticate('facebook'));

    router.get('/auth/facebook/callback', passport.authenticate('facebook',{      // control gets passed back to our server. passport fills up req.user with facebook user data.
        successRedirect: '/chatrooms',
        failureRedirect: '/'
    }));

    router.get('/logout', function(req,res,next){
       req.logout();
        res.redirect('/');
    });

    router.get('/room/:id', securePages, function(req,res,next){
        var room_name = findTitle(req.params.id);
        res.render('room',{user:req.user, room_number:req.params.id, room_name: room_name, config: config});               // req.params.id comes from  the /room/:id url where  .id = :id
    });

    function findTitle(room_id){
        var n = 0;
        while(n < rooms.length){
            if (rooms[n].room_number == room_id){
                return rooms[n].room_name;
                break;
            } else {
                n++;
                continue;
            }
        }
    }

    router.get('/chatrooms',securePages,function(req,res,next){                  // in the event you log out this route is inaccessible.
       res.render('chatrooms',{title:'chat rooms', user:req.user, config: config});              // req.user is available anywhere after facebook authentication, so send it to client.
    });




    /*router.get('/setcolor',function(req,res,next){
       req.session.favColor = "Red";
        res.send('setting favorite color !');
    });

    router.get('/getcolor',function(req,res,next){
       res.send('Favourite Color: '+(req.session.favColor===undefined?"Not found":req.session.favColor));        // req.session is either local or comes from production DB.
    }); */

    app.use('/',router);
};
