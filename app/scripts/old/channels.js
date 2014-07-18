define(['base/muceData'],
    function(MuceData) {
        var initData = function() {

            $('#channel_profiles').on('click', '.profile', function() {
                $('#channel_profiles .profile').removeClass('active');
                $(this).addClass('active');
                $('#channel_profiles .profile a').removeClass('active');
                $('a', this).addClass('active');
                cleanSourceTable();
                buildSourceTable();
            });

            $('#channelOpened').on('click', '.modify-btn', function() {
                var evtg = $(event.target);
                var ratio = evtg.siblings('input').val();
                var profileId = $('#channel_profiles li.profile a.active').attr('profileId');
                var source = evtg.attr('source');
                var data = {
                    name: source,
                    ratio: ratio
                };
                MuceData.putChannels(profileId, data).done(function(resp) {
                    cleanSourceTable();
                    buildSourceTable();
                });
            });

            $('#channelOpened').on('click', '.delete-channel', function() {
                var idDel = confirm("Do you really want to delte?");
                if (idDel == false) {
                    return;
                };
                var profileId = $('#channel_profiles li.profile a.active').attr('profileId');
                var source = $(event.target).attr('source');
                MuceData.deleteChannels(profileId, source).done(function(resp) {
                    cleanSourceTable();
                    buildSourceTable();
                });
            });

            $('#channelUnopened').on('click', '.open-btn', function() {
                var evtg = $(event.target);
                var ratio = evtg.siblings('input').val();
                var profileId = $('#channel_profiles li.profile a.active').attr('profileId');
                var source = evtg.attr('source');
                var data = {
                    name: source,
                    ratio: ratio
                };
                MuceData.putChannels(profileId, data).done(function(resp) {
                    cleanSourceTable();
                    buildSourceTable();
                });
            });

            var cleanSourceTable = function() {
                $('#channelUnopened').html('');
                $('#channelOpened').html('');
            };

            var buildSourceTable = function() {
                var profileId = $('#channel_profiles li.profile a.active').attr('profileId');
                MuceData.getChannels(profileId).done(function(resp) {
                    var open_table = '';
                    var profile = $('#channel_profiles li.profile a.active').text();
                    var unopen_table = _.template($('#channel_unopen_modal').html(), {
                        profileName: profile
                    });
                    var unopen_rows = '';
                    var open_table = _.template($('#channel_open_modal').html(), {
                        profileName: profile
                    });
                    var open_rows = '';
                    $('#channelUnopened').append(unopen_table);
                    $('#channelOpened').append(open_table);
                    for (i in resp) {
                        var name = resp[i].name;
                        var path = resp[i].accessPath;
                        var ratio = resp[i].ratio;
                        if (path == null) {
                            var tpl = _.template($('#channel_unopen_modal_row').html(), {
                                source: name
                            });
                            unopen_rows += tpl;
                        } else {
                            var tpl = _.template($('#channel_open_modal_row').html(), {
                                source: name,
                                accessPath: path,
                                ratio: ratio
                            });
                            open_rows += tpl;
                        }
                    }
                    $('#channel_unopen_modal_body').append(unopen_rows);
                    $('#channel_open_modal_body').append(open_rows);
                });
            };

            var buildProfiles = function() {
                var profiles = [{
                    id: 1,
                    name: 'Windows2x',
                }, {
                    id: 3,
                    name: 'Andriod',
                }];
                var tpl = '';
                for (i in profiles) {
                    tpl += _.template($('#channel_add_profile').html(), {
                        profileId: profiles[i].id,
                        profileName: profiles[i].name
                    });
                }
                $('#channel_profiles').append(tpl);
                $('#channel_profiles li:first').addClass('active');
                $('#channel_profiles li a:first').addClass('active');
            };
            var init = function() {
                buildProfiles();
                buildSourceTable();
            };

            init();
        }

        var factory = _.extend(function() {}, {
            getInstance: function() {
                return initData();
            }
        });
        return factory;
    });