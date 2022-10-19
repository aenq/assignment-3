const request = require('supertest')
const app = require('./../app')
const { sequelize } = require('./../models/index')
const { queryInterface } = sequelize
const { hash } = require('./../helpers/hash')
const { sign } = require('./../helpers/jwt')
const { use } = require('../routes')


const user = {
    username: 'mas_pujuhhh',
    email: 'maspujuh@gmail.com',
    password: 'mypass',
    createdAt: new Date(),
    updatedAt: new Date()
}

const userToken = sign({ id: 1, email: user.email })
const notUserToken = sign({ id: 99, email: 'notuser@gmail.com' })


const photo = {
    title: 'my Photo',
    caption: 'my Photo Caption',
    image_url: 'http://image.com/myimage.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    UserId: 1
}


beforeAll(async () => {
    await queryInterface.bulkDelete('Photos', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    })
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    })

    const hashedUser = { ...user }
    hashedUser.password = hash(hashedUser.password)
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('Photos', [photo]);
})

afterAll(async () => {
    sequelize.close()
})

describe('/GET /photos/:id', () => {
    test('should return HTTP status code 200', async () => {
        const { body } = await request(app)
            .get(`/photos/${1}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
        // console.log(body)

        expect(body).toEqual({
            id: expect.any(Number),
            title: photo.title,
            caption: photo.caption,
            image_url: photo.image_url,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            User: {
                id: expect.any(Number),
                username: user.username,
                email: user.email
            }
        })

    })
    test('should return HTTP status code 404 when id not found', async () => {
        const { body } = await request(app)
            .get(`/photos/${99}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404)
        expect(body.message).toMatch(/data not found/i)
    })
    test('should return HTTP status code 401 when no token input', async () => {
        const { body } = await request(app)
            .get(`/photos/${1}`)
            .expect(401)
        expect(body.message).toMatch(/unauthorized/i)
    })

    test('should return HTTP status code 401 when no token provider', async () => {
        const { body } = await request(app)
            .get(`/photos/${1}`)
            .set('Authorization', 'Bearer ')
            .expect(401)
        expect(body.message).toMatch(/invalid token/i)
    })
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .get('/photos')
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });

    test('should return HTTP status code 401 when wrong token', async () => {
        const { body } = await request(app)
            .get(`/photos/${1}`)
            .set('Authorization', `Bearer ${notUserToken}`)
            .expect(401)
        expect(body.message).toMatch(/unauthorized/i)
    })
})