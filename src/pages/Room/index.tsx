import logoImg from '../../assets/images/logo.svg';
import { Button } from '../../components/Button';
import { RoomCode } from '../../components/RoomCode';
import { useParams } from 'react-router';

import './styles.scss'
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/firebase';
import { Question } from '../../components/Question';

type FirebaseQuestions = Record<string, {
    author:{
        name:string;
        avatar:string;
    }
    content:string;
    isHighlighted:boolean;
    isAnswered:boolean;
}>

type QuestionType = {
    id: string;
    author:{
        name:string;
        avatar:string;
    }
    content:string;
    isHighlighted:boolean;
    isAnswered:boolean;
}

type RoomParams = {
    id: string;
}

export function Room(){
    //Pegando o Id da Sala
    const params = useParams<RoomParams>();
    const roomId = params.id

    // Pegando Informação da Pergunta
    const {user} = useAuth();
    const [newQuestion, setNewQuestion] = useState('');
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState('');

    //Carregando Dados da Sala
    useEffect(()=>{
        const roomRef = database.ref(`rooms/${roomId}`)

        roomRef.on('value',room =>{
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {}
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value])=>{
                return{
                    id:key,
                    content: value.content,
                    author:value.author,
                    isHighlighted:value.isHighlighted,
                    isAnswered:value.isAnswered,
                }
            })

            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions)
        })

    },[roomId]);

    async function handleSendQuestion(event: FormEvent){
        event.preventDefault();

        if(newQuestion.trim() === ''){
            return;
        }
        if(!user){
            throw new Error("You must be logged in");
        }
        const question = {
            content: newQuestion,
            author:{
                name:user.name,
                avatar: user.avatar,
            },
            isHighlighted: false,
            isAnswered: false,
        };
        // Adicionando pergunta ao banco
        await database.ref(`rooms/${roomId}/questions`).push(question);

        // Limpando o Input
        setNewQuestion('');
    }

    return(
       <div id='page-room'>
           <header>
               <div className="content">
                   <img src={logoImg} alt="Letmeask"/>
                   <RoomCode code={roomId}/>
               </div>
           </header>

           <main>
               <div className='room-title'>
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
               </div>

               <form onSubmit={handleSendQuestion}>
                   <textarea
                   placeholder="O que você quer perguntar"
                   onChange={event => setNewQuestion(event.target.value)}
                   value={newQuestion}
                   />
                   <div className="form-footer">
                        {user ? (
                            <div className='user-info'>
                                <img src={user.avatar} alt={user.name}/>
                                <span>{user.name}</span>
                            </div>
                        ):(
                            <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                   </div>
               </form>

            {/* Mostrando Perguntas em Tela */}
            <div className='question-list'>
                {questions.map(question =>{
                    return(
                        <Question
                        key={question.id}
                        content={question.content}
                        author={question.author}
                        />
                    );
                })}
            </div>
           </main>
       </div>
    )
}