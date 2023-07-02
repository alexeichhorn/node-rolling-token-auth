import RollingTokenManager from '.'

const tokenManager = new RollingTokenManager("testsecret", 100)

async function doTests() {

    const token = await tokenManager.generateToken()

    console.log(token)
}

doTests().then(res => {
    console.log("Finished")
})