package src;

public class Main {
    public static void main(String[] args) {
        Moveable m = new CarFactory().create();
        m.go();
    }
}