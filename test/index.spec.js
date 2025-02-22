/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import {
  createUserWithEmailAndPassword, getAuth, signInWithPopup, signInWithEmailAndPassword,
  signOut, updateProfile,
} from 'firebase/auth';
import {
  doc, updateDoc, db, addDoc, deleteDoc, getDocs,
} from 'firebase/firestore';
import {
  criarUsuario, loginGoogle, login, deslogar, editarPost, deletarPost, fetchData,
  atualizaPerfil, criarPost,
} from '../src/pages/serviceFirebase/firebaseAuth.js';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

beforeEach(() => {
  jest.clearAllMocks();
});

const mockUser = {
  user: {
    nome: 'Camila',
    email: 'test@example.com',
    senha: '123456',
  },
};

describe('criarUsuario is a function', () => {
  it('É uma função', () => {
    expect(typeof criarUsuario).toBe('function');
  });

  it('Criou um novo usuário', async () => {
    const authMock = getAuth();
    const testEmail = 'test@example.com'; // Renomeie a variável email para evitar conflito de escopo
    const senha = '123456';
    createUserWithEmailAndPassword.mockResolvedValue(mockUser);
    await criarUsuario(testEmail, senha);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(authMock, testEmail, senha);
  });
});

describe('signInWithEmailAndPassword', () => {
  it('deve logar com o usuario criado', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce();
    const email = 'email@aleatorio.com';
    const senha = 'senhaaleatoria';
    await login(email, senha);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(undefined, email, senha);
  });
});

describe('Login com o Google', () => {
  it('deveria ser uma função', () => {
    expect(typeof loginGoogle).toBe('function');
  });

  it('Deveria logar com o Google', async () => {
    signInWithPopup.mockResolvedValueOnce();
    // permite que defina o valor de retorno de uma função mockada como uma Promise resolvida
    await loginGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });
});

describe('deslogar', () => {
  it('deveria ser uma função', () => {
    expect(typeof deslogar).toBe('function');
  });

  it('deve deslogar o usuário', async () => {
    // Chama a função deslogar
    await deslogar();

    // Verifica se a função signOut foi chamada
    expect(signOut).toHaveBeenCalled();
    // Verifica se a função signOut foi chamada apenas uma vez
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('Editar Post', () => {
  it('Deveria atualizar o post do usuário', async () => {
    const postId = 'post_id_mock';
    const novaMensagem = 'Nova mensagem do post';

    doc.mockReturnValueOnce('docRef_mock');
    updateDoc.mockResolvedValueOnce();

    await editarPost(postId, novaMensagem);

    expect(doc).toHaveBeenCalledWith(db, 'Post', postId);
    expect(updateDoc).toHaveBeenCalledWith('docRef_mock', expect.anything());
  });
});

describe('deletarPost', () => {
  it('deveria ser uma função', () => {
    expect(typeof deletarPost).toBe('function');
  });

  it('deveria deletar um post', async () => {
    const postId = 'c5ZtMGYWOhWlIDLBUy1RHSLlCMD2'; // Substitua pelo postId válido
    await deletarPost(postId);
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

describe('criarPost', () => {
  it('deve criar um post e guardar na coleção', async () => {
    addDoc.mockResolvedValue();
    getAuth.mockReturnValue({
      currentUser: {
        displayName: 'Camila Gonçalves',
        uid: 'bJVtk9aBSaRSuJMlXrPZCqWRbon2',
      },
    });
    const mensagem = 'Nova mensagem';
    const novoPost = {
      mensagem,
      user_id: getAuth().currentUser.uid,
      nome: getAuth().currentUser.displayName,
      data: new Date(),
    };
    await criarPost(mensagem);
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toEqual(expect.anything(), novoPost);
  });
});

describe('atualizar o perfil', () => {
  it('deve chamar a função updateProfile e atualizar o nome do perfil', () => {
    const nome = 'aleatorio';
    getAuth.mockReturnValueOnce(mockUser);
    atualizaPerfil(nome);
    expect(updateProfile).toHaveBeenCalledWith(undefined, {
      displayName: nome,
    });
  });
});

describe('retorno dos dados do banco de dados', () => {
  it('deve retornar as publicações e os dados do banco de dados', async () => {
    const mockPublicacoes = [
      {
        id: '1',
        Post: 'Publicação 1',
      },
      {
        id: '2',
        Post: 'Publicação 2',
      },
    ];

    const querySnapshotMock = {
      forEach: (callback) => {
        mockPublicacoes.forEach((Post) => {
          callback({
            id: Post.id,
            data: () => ({
              ...Post,
            }),
          });
        });
      },
    };

    const getDocsMock = jest.fn(() => Promise.resolve(querySnapshotMock));
    getDocs.mockImplementation(getDocsMock);
    const result = await fetchData();
    expect(result).toEqual(mockPublicacoes);
  });
});
