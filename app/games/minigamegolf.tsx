import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from 'react-native-svg';

export default function MinigameGolf() {

    //Dimensioni dello schermo 
    const SCREEN_WIDTH = Dimensions.get("window").width;
    const SCREEN_HEIGHT = Dimensions.get("window").height;

    //stato del giroscopio
    const [{ x, y }, setGyroData] = useState({ x: 0, y: 0, z: 0 });

    //spostamento orizzontale per centrare il percorso
    const pathOffsetX = SCREEN_WIDTH / 2 - 75;

    // Definizione del percorso SVG come stringa
    const pathData = `
      M${pathOffsetX},100 
      Q${pathOffsetX + 100},150 ${pathOffsetX},200 
      T${pathOffsetX},300 
      T${pathOffsetX},400 
      T${pathOffsetX},500
    `;

    // Punti di controllo che approssimano la curva
    const curvedPathPoints = [
        { x: pathOffsetX, y: 100 },
        { x: pathOffsetX + 10, y: 125 },
        { x: pathOffsetX + 50, y: 125 },
        { x: pathOffsetX, y: 200 },
        { x: pathOffsetX - 50, y: 250 },
        { x: pathOffsetX, y: 300 },
        { x: pathOffsetX + 50, y: 350 },
        { x: pathOffsetX, y: 400 },
        { x: pathOffsetX - 50, y: 450 },
        { x: pathOffsetX, y: 500 },
    ];

    //stato della pallina
    const [ballPosition, setBallPosition] = useState({
        top: 100,
        left: pathOffsetX - 12.5, // spawn centrato
    });

    //useRef é un hook che permette di refenziare un valore NON NECESSARIO PER IL RENDERING
    //Usarlo non trifggera un rendering
    //Perfetto per memorizzare valori che non devono triggerare un rendering
    //In questo caso lo usiamo per memorizzare la velocità della pallina
    const velocityRef = useRef({ vx: 0, vy: 0 });

    //Sottoscrizione al giroscopio
    const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);

    //Stato per verificare se il giocatore ha vinto o perso
    const [hasWon, setHasWon] = useState(false);
    const [hasLost, setHasLost] = useState(false);

    //posizione della buca
    const holePosition = {
        top: 500,
        left: pathOffsetX,
        radius: 25,
    };

    Gyroscope.setUpdateInterval(50); // 50ms (20 Hz)

    //Sottoscrizione e rimozione del listener al giroscopio
    useEffect(() => {
        setSubscription(
            Gyroscope.addListener(data => {
                setGyroData(data);
            })
        );
        return () => {
            subscription?.remove();
            setSubscription(null);
        };
    }, []);

    // Verifica se la pallina è vicina a uno dei punti che simulano la curva
    function isBallNearPath(ballX: number, ballY: number, tolerance = 30) {
        return curvedPathPoints.some(({ x, y }) => {
            const dx = ballX - x;
            const dy = ballY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= tolerance;
        });
    }

    //Aggiorna la posizione della pallina in base alla velocità e alla posizione corrente
    //X ed Y sono le dipendenze, ogni volta che cambiano viene triggerata la useEffect
    useEffect(() => {
        //setInterval che avviene ogni 16ms (60fps)
        //serve a far muovere la pallina in maniera continua anche quando x ed y si fermano
        //in sostanza esso é il vero motore della pallina
        const interval = setInterval(() => {
            setBallPosition(pos => {
                if (hasWon || hasLost) return pos; // Se ha vinto o perso, ferma la pallina

                const acceleration = 0.5;
                const friction = 0.98;
                const maxSpeed = 20;

                //aggiorna la velocità in base al giroscopio
                velocityRef.current.vx += x * acceleration;
                velocityRef.current.vy += y * acceleration;

                //limita la velocità
                velocityRef.current.vx = Math.max(-maxSpeed, Math.min(maxSpeed, velocityRef.current.vx));
                velocityRef.current.vy = Math.max(-maxSpeed, Math.min(maxSpeed, velocityRef.current.vy));

                //applica attrito
                velocityRef.current.vx *= friction;
                velocityRef.current.vy *= friction;

                //aggiorna posizione
                let newTop = pos.top + velocityRef.current.vx;
                let newLeft = pos.left + velocityRef.current.vy;

                //limiti schermo
                newTop = Math.max(0, Math.min(SCREEN_HEIGHT - 25, newTop));
                newLeft = Math.max(0, Math.min(SCREEN_WIDTH - 25, newLeft));

                // centro della pallina
                const centerX = newLeft + 12.5;
                const centerY = newTop + 12.5;

                //se la pallina è uscita dal percorso, perdi
                if (!isBallNearPath(centerX, centerY)) {
                    setHasLost(true);
                }

                //Controllo collisione con la buca (distanza tra i centri dei cerchi)
                const dx = centerX - holePosition.left;
                const dy = centerY - holePosition.top;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < holePosition.radius) {
                    setHasWon(true);
                }

                return { top: newTop, left: newLeft };
            });
        }, 16);

        // pulisce l'intervallo quando il componente viene smontato
        //o quando x ed y cambiano
        return () => clearInterval(interval);
    }, [x, y, hasWon, hasLost]);

    return (
        <View style={styles.container}>

            {/* Punti di controllo visibili */}
            {curvedPathPoints.map((point, index) => (
            <View
                key={`control-${index}`}
                style={{
                position: 'absolute',
                top: point.y - 5, // centriamo il punto (diametro 10)
                left: point.x - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: 'red',
                zIndex: 10,
                }}
            />
            ))}


            {/* Percorso SVG */}
            <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
                <Path
                    d={pathData}
                    fill="none"
                    stroke="#ccc"
                    strokeWidth={50}
                    strokeLinecap="round"
                />
            </Svg>

            {/* Buca */}
            <View style={[styles.hole, { top: holePosition.top - 25, left: holePosition.left - 25 }]} />

            {/* Pallina */}
            <View style={[styles.ball, { top: ballPosition.top, left: ballPosition.left }]} />

            {/* Messaggi */}
            {hasWon && (
                <View style={styles.message}>
                    <Text style={styles.winText}>🏆 Hai vinto!</Text>
                </View>
            )}
            {hasLost && (
                <View style={styles.message}>
                    <Text style={[styles.winText, { color: 'red' }]}>💀 Hai perso!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    ball: {
        position: 'absolute',
        width: 25,
        height: 25,
        borderRadius: 25,
        backgroundColor: 'green',
    },
    hole: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'black',
    },
    message: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    winText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'green',
    },
});
