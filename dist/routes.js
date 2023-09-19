import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import { z } from 'zod';
const app = express();
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(new URL('public', import.meta.url).pathname));
const Database = z.object({
    name: z.string(),
    email: z.string().email(),
});
const db = [];
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/form', (req, res) => {
    res.render('form', { db });
});
app.post('/add', (req, res) => {
    const { name, email } = req.body;
    try {
        // Valide os dados do formulário usando o esquema do Zod
        Database.parse({ name, email });
        // Se a validação for bem-sucedida, adicione os dados ao banco de dados
        db.push({ name, email });
        res.redirect('/form');
    }
    catch (error) {
        // Se a validação falhar, você pode tratar o erro aqui
        // Por exemplo, redirecionar de volta ao formulário com uma mensagem de erro
        res.render('form', { db, error: "Email ou senha inválido!" });
    }
});
app.get('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.splice(Number(id), 1);
    res.redirect('/form');
});
app.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    const user = db[Number(id)];
    res.render('edit', { user, id });
});
app.post('/add/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    // Use o método safeParse para validar os dados
    const validationResult = Database.safeParse({ name, email });
    if (validationResult.success) {
        db[Number(id)] = { name, email };
        res.redirect('/form');
    }
    else {
        // Renderize a página de edição com uma mensagem de erro, mas não redirecione
        res.render('edit', { errorEdit: "Formato de email inválido!", user: db[Number(id)], id });
    }
});
export default app;
