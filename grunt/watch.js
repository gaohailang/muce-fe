module.exports = {
    watch: {
        compass: {
            files: ['<%= paths.app %>/styles/**/*'],
            tasks: ['compass:dev']
        }
    },
    compass: {
        options: {
            importPath: '<%= paths.app %>/components',
            sassDir: '<%= paths.sass %>',
            cssDir: '<%= paths.css %>',
            imagesDir: '<%= paths.app %>/images',
            generatedImagesDir: '<%= paths.tmp %>/images',
            httpImagesPath: '../images',
            httpGeneratedImagesPath: '../images',
        },
        dev: {
            options: {
                assetCacheBuster: true
            }
        },
        dist: {
            options: {
                assetCacheBuster: false
            }
        }
    }
}