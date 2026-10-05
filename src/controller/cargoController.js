import cargoModel from '../model/cargoModel.js';

async function listar(req, res) {
    try {
        const idEmpresa = req.params.id;
        const rows = await cargoModel.listar(idEmpresa);
        const cargos = {};

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            if (!cargos[row.id_cargo]){
                cargos[row.id_cargo] = {
                    id_cargo: row.id_cargo,
                    nome_cargo: row.nome_cargo,
                    permissoes: []
                }
                
            }

            

            if (row.permissoes !== null) {
                cargos[row.id_cargo].permissoes.push(row.id_permissao)
            }

        }

        res.json(Object.values(cargos));
    } catch (err) {
        console.error(err);
        res.status(500).json({
            erro: 'Erro ao buscar cargos.'
        });
    }
}

async function atualizar(req, res) {
    try {
        const idCargo = req.params.id;
        console.log(idCargo)
        const {nome_cargo, permissoes} = req.body;

        await cargoModel.atualizar(idCargo, nome_cargo, permissoes)

        res.status(200).json({
            mensagem: 'Cargo atualizado com sucesso!'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem: 'Erro ao atualizar usuário!'
        })
    }
}

async function deletar(req, res) {
    try {
        const idCargo = req.params.id;

        await cargoModel.deletar(idCargo);
        res.status(204).send()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem: 'Erro ao excluir cargo.'
        })
    }
}

async function criar(req, res) {
    try {
        console.log('BODY:', req.body);
        console.log('PARAMS:', req.params);

        const { nome_cargo, permissoes } = req.body;
        const idEmpresa = req.params.id;

        console.log('NOME:', nome_cargo);
        console.log('PERMISSOES:', permissoes);
        console.log('EMPRESA:', idEmpresa);

        const idCargo = await cargoModel.criar(nome_cargo, permissoes, idEmpresa);

        res.status(201).json({
            mensagem: 'Cargo criado com sucesso!',
            idCargo: idCargo
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao criar cargo.'
        });
    }
}

export default { listar, deletar, criar, atualizar};