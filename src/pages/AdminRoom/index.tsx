import logoImg from '../../assets/images/logo.svg';
import deleteImg from '../../assets/images/delete.svg';
import { Button } from '../../components/Button';
import { RoomCode } from '../../components/RoomCode';
import { useHistory, useParams } from 'react-router';

import { database } from '../../services/firebase';
import { Question } from '../../components/Question';
import { useRoom } from '../../hooks/useRoom';


type RoomParams = {
    id: string;
}

export function AdminRoom(){
    //Pegando o Id da Sala
    const history = useHistory();
    const params = useParams<RoomParams>();
    const roomId = params.id
    const {title, questions} = useRoom(roomId)

    async function handleEndRoom(){
        await database.ref(`rooms/${roomId}`).update({
            endedAt: new Date(), 
        })

        history.push('/');
    }
    async function handleDeleteQuestion(questionId: string){
        if(window.confirm('Tem Certeza que deseja excluir está pergunta?')){
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        }
    }

    return(
       <div id='page-room'>
           <header>
               <div className="content">
                   <img src={logoImg} alt="Letmeask"/>
                   <div>
                    <RoomCode code={roomId}/>
                    <Button isOutlined onClick={handleEndRoom}>Encerrar Sala</Button>
                   </div>
               </div>
           </header>

           <main>
               <div className='room-title'>
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
               </div>

            {/* Mostrando Perguntas em Tela */}
            <div className='question-list'>
                {questions.map(question =>{
                    return(
                        <Question
                        key={question.id}
                        content={question.content}
                        author={question.author}
                        >
                            <button
                            type="button"
                            onClick={() => handleDeleteQuestion(question.id)}
                            >
                                <img src={deleteImg} alt='delete image'></img>
                            </button>
                        </Question>
                    );
                })}
            </div>
           </main>
       </div>
    )
}