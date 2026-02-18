class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM", "no-reply@sweetnest.cl")
  layout 'mailer'
end
