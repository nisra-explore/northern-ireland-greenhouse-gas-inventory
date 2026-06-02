export async function readData (matrix) {

    try {
        const res = await fetch("public/data/data.json");
        const data = await res.json();

        return data[matrix];

    } catch (error) {
        console.error("Failed to load data:", error);
        return; 
    }
    
}