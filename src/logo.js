const logo = require('asciiart-logo');


exports.default = (config, settings)=>{
    return ()=>{
        console.log(
            logo({
                name: config.name,
                font: settings.intro.font,
                lineChars: settings.intro.lc,
                padding: settings.intro.pa,
                margin: settings.intro.ma,
                borderColor: settings.intro.border,
                logoColor: settings.intro.color,
                textColor: settings.intro.text
            })
            .emptyLine().right(config.version)
            .emptyLine().center(config.description)
            .emptyLine().center(`Listening at http://localhost:${process.env.PORT || settings.port}`)
            .render()
        )
    }
}