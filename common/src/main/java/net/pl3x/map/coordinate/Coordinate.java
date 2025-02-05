package net.pl3x.map.coordinate;

import net.pl3x.map.markers.Point;

/**
 * Represents coordinates
 */
public abstract class Coordinate extends Point {
    public Coordinate(int x, int z) {
        super(x, z);
    }

    /**
     * Get the block X value of this coordinate
     *
     * @return block X coordinate value
     */
    public abstract int getBlockX();

    /**
     * Get the block Z value of this coordinate
     *
     * @return block Z coordinate value
     */
    public abstract int getBlockZ();

    /**
     * Get the chunk X value of this coordinate
     *
     * @return chunk X coordinate value
     */
    public abstract int getChunkX();

    /**
     * Get the chunk Z value of this coordinate
     *
     * @return chunk Z coordinate value
     */
    public abstract int getChunkZ();

    /**
     * Get the region X value of this coordinate
     *
     * @return region X coordinate value
     */
    public abstract int getRegionX();

    /**
     * Get the region Z value of this coordinate
     *
     * @return region Z coordinate value
     */
    public abstract int getRegionZ();

    public abstract Coordinate east();

    public abstract Coordinate north();

    public abstract Coordinate south();

    public abstract Coordinate west();

    /**
     * Get a new BlockCoordinate from this coordinate
     *
     * @return BlockCoordinate
     */
    public BlockCoordinate getBlockCoordinate() {
        return new BlockCoordinate(getBlockX(), getBlockZ());
    }

    /**
     * Get a new ChunkCoordinate from this coordinate
     *
     * @return ChunkCoordinate
     */
    public ChunkCoordinate getChunkCoordinate() {
        return new ChunkCoordinate(getChunkX(), getChunkZ());
    }

    /**
     * Get a new RegionCoordinate from this coordinate
     *
     * @return RegionCoordinate
     */
    public RegionCoordinate getRegionCoordinate() {
        return new RegionCoordinate(getRegionX(), getRegionZ());
    }

    @Override
    public String toString() {
        return "Coordinate{x=" + getX() + ",z=" + getZ() + "}";
    }

    /**
     * Convert a region coordinate to block coordinate
     *
     * @param n Region coordinate
     * @return Block coordinate
     */
    public static int regionToBlock(int n) {
        return n << 9;
    }

    /**
     * Convert a block coordinate to region coordinate
     *
     * @param n Block coordinate
     * @return Region coordinate
     */
    public static int blockToRegion(int n) {
        return n >> 9;
    }

    /**
     * Convert a region coordinate to chunk coordinate
     *
     * @param n Region coordinate
     * @return Chunk coordinate
     */
    public static int regionToChunk(int n) {
        return n << 5;
    }

    /**
     * Convert a chunk coordinate to region coordinate
     *
     * @param n Chunk coordinate
     * @return Region coordinate
     */
    public static int chunkToRegion(int n) {
        return n >> 5;
    }

    /**
     * Convert a chunk coordinate to block coordinate
     *
     * @param n Chunk coordinate
     * @return Block coordinate
     */
    public static int chunkToBlock(int n) {
        return n << 4;
    }

    /**
     * Convert a block coordinate to chunk coordinate
     *
     * @param n Block coordinate
     * @return Chunk coordinate
     */
    public static int blockToChunk(int n) {
        return n >> 4;
    }
}
