module.exports.login = (req,res) => {
    res.render('forwarder/login')
}

module.exports.landing = (req,res) => {
    res.locals.title = 'Get Paid to Forward Packages From Your Home'
    res.locals.description = 'Become a package forwarder and turn your home address into side income. Earn $15 dollars per package plus extras. Paid out weekly.'
    res.render('forwarder/landing')
}