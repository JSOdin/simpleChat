module.exports = function(passport,FacebookStrategy, config, mongoose){
    var chatUser= new mongoose.Schema({
       profileID: String,
        fullname: String,
        profilePic: String
    });

    var userModel = mongoose.model('chatUser',chatUser);

    passport.serializeUser(function(user,done){                     // stores a user's reference in the session so that the user data persists
        done(null, user.id);
    });

    passport.deserializeUser(function(id,done){                      // whenever you require fetching of user data deserialize is called
       userModel.findById(id, function(err,user){
          done(err,user);
       });
    });

    passport.use(new FacebookStrategy({
        clientID: config.fb.appID,
        clientSecret: config.fb.appSecret,
        callbackURL: config.fb.callbackURL,
        profileFields: ['id', 'displayName','photos']

    },function(accessToken, refreshToken, profile, done){               //callback into which the tokens and profile gets passed in
        //check if the user exists in our mongodb db
        // if not, create one and return the profile
        // if the user exists, return the profile

        userModel.findOne({profileID: profile.id},function(err, result){
            if(result){
                done(null, result);      // return the user;
            } else {
                // create a new user in our mongolab account

                var newChatUser = new userModel({
                    profileID: profile.id,
                    fullname: profile.displayName,
                    profilePic: profile.photos[0].value || ''
                });

                newChatUser.save(function(err){
                    done(null, newChatUser);
                });
            }
        })
    }))
};
