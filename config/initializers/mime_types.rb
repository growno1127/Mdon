# Be sure to restart your server when you modify this file.

Mime::Type.register "application/json",           :json, %w( text/x-json application/jsonrequest application/jrd+json )
Mime::Type.register "text/xml",                   :xml,  %w( application/xml application/atom+xml application/xrd+xml )
Mime::Type.register "application/activity+json",  :activitystreams2
