const request = require('supertest')
const app = require('./../app')
const { sequelize } = require('./../models/index')
const { queryInterface } = sequelize
const { hash } = require('./../helpers/hash')
const { sign } = require('./../helpers/jwt')


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

const newPhoto = {
    title: 'add new Photo',
    //caption telah di hooks di model
    image_url: 'http://image.com/add_new_image.png',
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


describe('POST /photos', () => {
    test('should return HTTP status code 201', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: newPhoto.title,
                //caption telah di hooks di model
                image_url: newPhoto.image_url,
                createdAt: newPhoto.createdAt,
                updatedAt: newPhoto.updatedAt,
                UserId: newPhoto.UserId
            })
            .expect(201)
        // console.log(body)
        expect(body).toEqual({
            id: 2,
            title: newPhoto.title,
            image_url: newPhoto.image_url,
            UserId: newPhoto.UserId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            caption: expect.any(String),
        })
    })

    test('should return HTTP code 400 when post photos without title', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                id: 2,
                image_url: newPhoto.image_url,
                UserId: newPhoto.UserId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                caption: expect.any(String),
            })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be omitted']));
    });
    test('should return HTTP code 400 when post photos with empty string title', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                id: 2,
                title: "",
                image_url: newPhoto.image_url,
                UserId: newPhoto.UserId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                caption: expect.any(String),
            })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be an empty string']));
    });
    test('should return HTTP code 400 when post photos without image_url', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                id: 2,
                UserId: newPhoto.UserId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                caption: expect.any(String),
            })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be omitted']));
    });
    test('should return HTTP code 400 when post photos with empty string image_url', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                id: 2,
                title: newPhoto.title,
                image_url: "",
                UserId: newPhoto.UserId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                caption: expect.any(String),
            })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be an empty string']));
    });

    test('should return HTTP code 400 when post photos with wrong image_url format', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                id: 2,
                title: newPhoto.title,
                image_url: "abc",
                UserId: newPhoto.UserId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                caption: expect.any(String),
            })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Wrong URL format']));
    });

    test('should return HTTP status code 401 when no token input', async () => {
        const { body } = await request(app)
            .get('/photos')
            .expect(401)
        expect(body.message).toMatch(/unauthorized/i)
    })

    test('should return HTTP status code 401 when no token provider', async () => {
        const { body } = await request(app)
            .get('/photos')
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
            .get('/photos')
            .set('Authorization', `Bearer ${notUserToken}`)
            .expect(401)
        expect(body.message).toMatch(/unauthorized/i)
    })
})