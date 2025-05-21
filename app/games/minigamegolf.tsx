import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from 'react-native-svg';

export default function MinigameGolf() {

    //Dimensioni dello schermo 
    const SCREEN_WIDTH = Dimensions.get("window").width;
    const SCREEN_HEIGHT = Dimensions.get("window").height;

    const [gyroBias, setGyroBias] = useState({ x: 0, y: 0 });
    const [isCalibrating, setIsCalibrating] = useState(true);

    const calibrateGyroscope = async () => {
        setIsCalibrating(true);

        

        const samples: { x: number; y: number; z: number }[] = [];
        const subscription = Gyroscope.addListener(data => {
            samples.push(data);
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        subscription.remove();

        const average = samples.reduce(
            (acc, val) => ({
                x: acc.x + val.x / samples.length,
                y: acc.y + val.y / samples.length,
                z: acc.z + val.z / samples.length,
            }),
            { x: 0, y: 0, z: 0 }
        );

        setGyroBias({ x: average.x, y: average.y });
        setIsCalibrating(false);
    };

      
    

    //stato del giroscopio
    const [{ x, y }, setGyroData] = useState({ x: 0, y: 0, z: 0 });

    const maxY = SCREEN_HEIGHT - 100; // margine per buca e UI

    //spostamento orizzontale per centrare il percorso
    const pathOffsetX = SCREEN_WIDTH / 2;

    // Definizione del percorso SVG come stringa 
    const pathData = `
        M${pathOffsetX},50 
        H${pathOffsetX + 100}
        C${pathOffsetX + 200},50 ${pathOffsetX + 200},200 ${pathOffsetX + 100},200
        H${pathOffsetX - 50}
        C${pathOffsetX - 100 },200 ${pathOffsetX - 50 },400 ${pathOffsetX},400
        C${pathOffsetX},400 ${pathOffsetX + 100},400 ${pathOffsetX + 100},350
        C${pathOffsetX + 100},300 ${pathOffsetX + 300},350 ${pathOffsetX + 200},600
        C${pathOffsetX + 200},600 ${pathOffsetX -50 },600 ${pathOffsetX - 50},650
    `;



    // Punti di controllo che approssimano la curva
    const curvedPathPoints = [
        { x: pathOffsetX, y: 50 },
        { x: pathOffsetX + 25, y: 50 },
        { x: pathOffsetX + 50, y: 50 },
        { x: pathOffsetX + 75, y: 50 },
        { x: pathOffsetX + 100, y: 50 },
        { x: pathOffsetX + 125, y: 55 },
        { x: pathOffsetX + 140, y: 60 },
        { x: pathOffsetX + 150, y: 70 },
        { x: pathOffsetX + 165, y: 80 },
        { x: pathOffsetX + 175, y: 95 },
        { x: pathOffsetX + 175, y: 110 },
        { x: pathOffsetX + 175, y: 120 },
        { x: pathOffsetX + 175, y: 135 },
        { x: pathOffsetX + 175, y: 150 },
        { x: pathOffsetX + 165, y: 165 },
        { x: pathOffsetX + 150, y: 180 },
        { x: pathOffsetX + 135, y: 190 },
        { x: pathOffsetX + 125, y: 200 },
        { x: pathOffsetX + 100, y: 200 },
        { x: pathOffsetX + 75, y: 200 },
        { x: pathOffsetX + 50, y: 200 },
        { x: pathOffsetX + 25, y: 200 },
        { x: pathOffsetX + 0, y: 200 },
        { x: pathOffsetX - 25, y: 200 },
        { x: pathOffsetX - 50, y: 200 },
        { x: pathOffsetX - 65, y: 220 },
        { x: pathOffsetX - 70, y: 240 },
        { x: pathOffsetX - 70, y: 260 },
        { x: pathOffsetX - 65, y: 280 },
        { x: pathOffsetX - 60, y: 300 },
        { x: pathOffsetX - 60, y: 320 },
        { x: pathOffsetX - 50, y: 340 },
        { x: pathOffsetX - 40, y: 360 },
        { x: pathOffsetX - 30, y: 380 },
        { x: pathOffsetX - 20, y: 395 },
        { x: pathOffsetX - 0, y: 395 },
        { x: pathOffsetX + 20, y: 395 },
        { x: pathOffsetX + 40, y: 395 },
        { x: pathOffsetX + 60, y: 390 },
        { x: pathOffsetX + 80, y: 380 },
        { x: pathOffsetX + 95, y: 360 },
        { x: pathOffsetX + 115, y: 340 },
        { x: pathOffsetX + 130, y: 335 },
        { x: pathOffsetX + 150, y: 340 },
        { x: pathOffsetX + 170, y: 355 },
        { x: pathOffsetX + 190, y: 370 },
        { x: pathOffsetX + 210, y: 390 },
        { x: pathOffsetX + 220, y: 410 },
        { x: pathOffsetX + 225, y: 430 },
        { x: pathOffsetX + 225, y: 450 },
        { x: pathOffsetX + 225, y: 470 },
        { x: pathOffsetX + 225, y: 490 },
        { x: pathOffsetX + 225, y: 510 },
        { x: pathOffsetX + 220, y: 530 },
        { x: pathOffsetX + 215, y: 550 },
        { x: pathOffsetX + 210, y: 570 },
        { x: pathOffsetX + 205, y: 590 },
        { x: pathOffsetX + 200, y: 600 },
        { x: pathOffsetX + 180, y: 600 },
        { x: pathOffsetX + 160, y: 600 },
        { x: pathOffsetX + 140, y: 605 },
        { x: pathOffsetX + 120, y: 605 },
        { x: pathOffsetX + 100, y: 605 },
        { x: pathOffsetX + 80, y: 610 },
        { x: pathOffsetX + 60, y: 610 },
        { x: pathOffsetX + 40, y: 615 },
        { x: pathOffsetX + 20, y: 615 },
        { x: pathOffsetX + 0, y: 615 },
        { x: pathOffsetX - 20, y: 620 },
        { x: pathOffsetX - 40, y: 630 },


    ];


    //stato della pallina
    const [ballPosition, setBallPosition] = useState({
        top: 50,
        left: pathOffsetX - 12.5,
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
        top: y + 650,
        left: pathOffsetX - 50,
        radius: 25,
    };
    Gyroscope.setUpdateInterval(50); // 50ms (20 Hz)

    //Sottoscrizione e rimozione del listener al giroscopio
    useEffect(() => {
        const init = async () => {
            await calibrateGyroscope();
            setSubscription(
                Gyroscope.addListener(data => {
                    // Rimuove il bias dalla lettura
                    setGyroData({
                        x: data.x - gyroBias.x,
                        y: data.y - gyroBias.y,
                        z: data.z
                    });
                })
            );
        };
        init();
    
        return () => {
            subscription?.remove();
            setSubscription(null);
        };
    }, []);

    // Verifica se la pallina è vicina a uno dei punti che simulano la curva
    function isBallNearPath(ballX: number, ballY: number, tolerance = 20) {
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
        <View style={[styles.container, { alignItems: 'center' }]} >


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
            {(hasWon || hasLost || isCalibrating) && (
        <View style={styles.overlay}>
            <View style={styles.messageBox}>
            {hasWon && <Text style={styles.winText}>🏆 Hai vinto!</Text>}
            {hasLost && <Text style={[styles.winText, { color: 'red' }]}>💀 Hai perso!</Text>}
            {isCalibrating && <Text style={[styles.winText, { color: 'orange' }]}>⏳ Calibrazione...</Text>}
            </View>
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
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // sfondo scuro semitrasparente
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      },
      messageBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        width: '60%',           // OCCUPA l' x% della larghezza dello schermo
        maxWidth: 300,          // Limita la larghezza massima
        alignItems: 'center',
        justifyContent: 'center',
      },
      
});
